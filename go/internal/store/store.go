// Package store persists conversion jobs and presets in an embedded SQLite database.
package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"path/filepath"
	"time"

	// The spec suggested modernc.org/sqlite to avoid cgo, but its pure-Go libc
	// panics on Android: the fstatat/lstat syscalls it issues are musl-shaped and
	// bionic rejects them, which crashes the process during sqlite3_open_v2 on
	// first path resolution. This build already requires cgo for the SIMD
	// kernels, so a cgo SQLite costs nothing extra and keeps the relational
	// schema the spec also asks for.
	_ "github.com/mattn/go-sqlite3"
)

// Status values for a conversion job.
const (
	StatusQueued     = "queued"
	StatusProcessing = "processing"
	StatusCompleted  = "completed"
	StatusFailed     = "failed"
)

var ErrNotFound = errors.New("eliverter: record not found")

type Job struct {
	ID             string
	SourceFilename string
	SourceFormat   string
	TargetFormat   string
	Status         string
	ProgressPct    float64
	OutputSize     int64
	ErrorMessage   string
	SourcePath     string
	OutputPath     string
	PresetID       string
	CreatedAt      time.Time
	CompletedAt    time.Time
}

type Preset struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	TargetExt     string    `json:"target_extension"`
	VideoCodec    string    `json:"video_codec"`
	AudioCodec    string    `json:"audio_codec"`
	CustomFilters string    `json:"custom_filters"`
	IsFavorite    bool      `json:"is_favorite"`
	CreatedAt     time.Time `json:"created_at"`
}

const schema = `
CREATE TABLE IF NOT EXISTS conversion_jobs (
	id              TEXT PRIMARY KEY,
	source_filename TEXT NOT NULL,
	source_format   TEXT NOT NULL,
	target_format   TEXT NOT NULL,
	status          TEXT NOT NULL,
	progress_pct    REAL NOT NULL DEFAULT 0,
	output_size     INTEGER NOT NULL DEFAULT 0,
	error_message   TEXT NOT NULL DEFAULT '',
	source_path     TEXT NOT NULL DEFAULT '',
	output_path     TEXT NOT NULL DEFAULT '',
	preset_id       TEXT NOT NULL DEFAULT '',
	created_at      TIMESTAMP NOT NULL,
	completed_at    TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON conversion_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON conversion_jobs(created_at DESC);

CREATE TABLE IF NOT EXISTS user_presets (
	id             TEXT PRIMARY KEY,
	name           TEXT NOT NULL,
	target_ext     TEXT NOT NULL DEFAULT '',
	video_codec    TEXT NOT NULL DEFAULT '',
	audio_codec    TEXT NOT NULL DEFAULT '',
	custom_filters TEXT NOT NULL DEFAULT '',
	is_favorite    INTEGER NOT NULL DEFAULT 0,
	created_at     TIMESTAMP NOT NULL
);
`

type DB struct{ sql *sql.DB }

// Open creates or attaches the embedded database at path.
func Open(path string) (*DB, error) {
	dsn := fmt.Sprintf("file:%s?_journal_mode=WAL&_busy_timeout=5000&_foreign_keys=1", filepath.ToSlash(path))
	raw, err := sql.Open("sqlite3", dsn)
	if err != nil {
		return nil, fmt.Errorf("open sqlite: %w", err)
	}
	// SQLite serialises writes; a single connection avoids SQLITE_BUSY churn.
	raw.SetMaxOpenConns(1)
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	if _, err := raw.ExecContext(ctx, schema); err != nil {
		raw.Close()
		return nil, fmt.Errorf("migrate: %w", err)
	}
	return &DB{sql: raw}, nil
}

func (d *DB) Close() error { return d.sql.Close() }

func (d *DB) CreateJob(ctx context.Context, j *Job) error {
	if j.CreatedAt.IsZero() {
		j.CreatedAt = time.Now().UTC()
	}
	if j.Status == "" {
		j.Status = StatusQueued
	}
	_, err := d.sql.ExecContext(ctx, `INSERT INTO conversion_jobs
		(id, source_filename, source_format, target_format, status, progress_pct,
		 output_size, error_message, source_path, output_path, preset_id, created_at)
		VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
		j.ID, j.SourceFilename, j.SourceFormat, j.TargetFormat, j.Status, j.ProgressPct,
		j.OutputSize, j.ErrorMessage, j.SourcePath, j.OutputPath, j.PresetID, j.CreatedAt)
	return err
}

const jobCols = `id, source_filename, source_format, target_format, status, progress_pct,
	output_size, error_message, source_path, output_path, preset_id, created_at, completed_at`

func scanJob(s scanner) (*Job, error) {
	j := &Job{}
	var created string
	var completed sql.NullString
	if err := s.Scan(&j.ID, &j.SourceFilename, &j.SourceFormat, &j.TargetFormat, &j.Status,
		&j.ProgressPct, &j.OutputSize, &j.ErrorMessage, &j.SourcePath, &j.OutputPath,
		&j.PresetID, &created, &completed); err != nil {
		return nil, err
	}
	j.CreatedAt, _ = time.Parse(time.RFC3339Nano, created)
	if completed.Valid {
		j.CompletedAt, _ = time.Parse(time.RFC3339Nano, completed.String)
	}
	return j, nil
}

type scanner interface{ Scan(dest ...any) error }

func (d *DB) SetProgress(ctx context.Context, id string, status string, pct float64) error {
	_, err := d.sql.ExecContext(ctx,
		`UPDATE conversion_jobs SET status=?, progress_pct=? WHERE id=?`, status, pct, id)
	return err
}

func (d *DB) Finish(ctx context.Context, id, status string, outSize int64, outPath, errMsg string) error {
	now := time.Now().UTC().Format(time.RFC3339Nano)
	_, err := d.sql.ExecContext(ctx,
		`UPDATE conversion_jobs SET status=?, progress_pct=?, output_size=?, output_path=?,
		 error_message=?, completed_at=? WHERE id=?`,
		status, pctFor(status), outSize, outPath, errMsg, now, id)
	return err
}

func pctFor(status string) float64 {
	if status == StatusCompleted {
		return 100
	}
	return 0
}

func (d *DB) GetJob(ctx context.Context, id string) (*Job, error) {
	row := d.sql.QueryRowContext(ctx, `SELECT `+jobCols+` FROM conversion_jobs WHERE id=?`, id)
	j, err := scanJob(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return j, err
}

func (d *DB) ListJobs(ctx context.Context, limit int) ([]*Job, error) {
	if limit <= 0 || limit > 500 {
		limit = 50
	}
	rows, err := d.sql.QueryContext(ctx,
		`SELECT `+jobCols+` FROM conversion_jobs ORDER BY created_at DESC LIMIT ?`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*Job, 0, limit)
	for rows.Next() {
		j, err := scanJob(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, j)
	}
	return out, rows.Err()
}

func (d *DB) PutPreset(ctx context.Context, p *Preset) error {
	if p.CreatedAt.IsZero() {
		p.CreatedAt = time.Now().UTC()
	}
	fav := 0
	if p.IsFavorite {
		fav = 1
	}
	_, err := d.sql.ExecContext(ctx, `INSERT INTO user_presets
		(id, name, target_ext, video_codec, audio_codec, custom_filters, is_favorite, created_at)
		VALUES (?,?,?,?,?,?,?,?)
		ON CONFLICT(id) DO UPDATE SET
			name=excluded.name, target_ext=excluded.target_ext, video_codec=excluded.video_codec,
			audio_codec=excluded.audio_codec, custom_filters=excluded.custom_filters,
			is_favorite=excluded.is_favorite`,
		p.ID, p.Name, p.TargetExt, p.VideoCodec, p.AudioCodec, p.CustomFilters, fav,
		p.CreatedAt.Format(time.RFC3339Nano))
	return err
}

const presetCols = `id, name, target_ext, video_codec, audio_codec, custom_filters, is_favorite, created_at`

func (d *DB) GetPreset(ctx context.Context, id string) (*Preset, error) {
	row := d.sql.QueryRowContext(ctx, `SELECT `+presetCols+` FROM user_presets WHERE id=?`, id)
	p := &Preset{}
	var fav int
	var created string
	err := row.Scan(&p.ID, &p.Name, &p.TargetExt, &p.VideoCodec, &p.AudioCodec,
		&p.CustomFilters, &fav, &created)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	p.IsFavorite = fav != 0
	p.CreatedAt, _ = time.Parse(time.RFC3339Nano, created)
	return p, nil
}

func (d *DB) ListPresets(ctx context.Context) ([]*Preset, error) {
	rows, err := d.sql.QueryContext(ctx, `SELECT id, name, target_ext, video_codec, audio_codec,
		custom_filters, is_favorite, created_at FROM user_presets ORDER BY is_favorite DESC, name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*Preset, 0, 16)
	for rows.Next() {
		p := &Preset{}
		var fav int
		var created string
		if err := rows.Scan(&p.ID, &p.Name, &p.TargetExt, &p.VideoCodec, &p.AudioCodec,
			&p.CustomFilters, &fav, &created); err != nil {
			return nil, err
		}
		p.IsFavorite = fav != 0
		p.CreatedAt, _ = time.Parse(time.RFC3339Nano, created)
		out = append(out, p)
	}
	return out, rows.Err()
}

func (d *DB) DeletePreset(ctx context.Context, id string) error {
	res, err := d.sql.ExecContext(ctx, `DELETE FROM user_presets WHERE id=?`, id)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return ErrNotFound
	}
	return nil
}

// PurgeOlderThan deletes job rows whose output is older than maxAge, returning the count removed.
func (d *DB) PurgeOlderThan(ctx context.Context, maxAge time.Duration) (int64, error) {
	cutoff := time.Now().UTC().Add(-maxAge).Format(time.RFC3339Nano)
	res, err := d.sql.ExecContext(ctx,
		`DELETE FROM conversion_jobs WHERE created_at < ? AND status IN (?,?)`,
		cutoff, StatusCompleted, StatusFailed)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}
