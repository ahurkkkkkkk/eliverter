package accel

import "errors"

// ErrEmptyInput is returned when a kernel receives nothing to analyse.
var ErrEmptyInput = errors.New("accel: empty input buffer")
