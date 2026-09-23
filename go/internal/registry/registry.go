// Package registry is the media taxonomy: every container, codec, sub-format and
// pixel format Eliverter knows how to probe, demux, transcode, filter and mux.
//
// Nothing here panics. Unknown input resolves to KindUnknown with a usable
// passthrough plan so the pipeline can still attempt a conversion and report a
// structured error instead of throwing an unhandled exception.
package registry

import (
	"path/filepath"
	"sort"
	"strings"
)

type Kind string

const (
	KindVideo   Kind = "video"
	KindAudio   Kind = "audio"
	KindImage   Kind = "image"
	KindArchive Kind = "sequence"
	KindUnknown Kind = "unknown"
)

// Family groups formats that behave alike when choosing an encoder.
type Family string

const (
	FamilyModern     Family = "modern"    // mp4 / webm / mkv / mov ...
	FamilyBroadcast  Family = "broadcast" // mxf / gxf / dv / nut ...
	FamilyRetro      Family = "retro"     // bik / smk / mve / vqa / cin ...
	FamilyLossless   Family = "lossless"
	FamilySpeech     Family = "speech"     // amr / speex / g7xx / gsm
	FamilyAudiophile Family = "audiophile" // flac / alac / ape / wv / tta
)

// Container describes one demuxer/muxer pair and the extensions that map to it.
// JSON tags keep this endpoint in the same lowerCamel case as the rest of the API.
type Container struct {
	Key         string   `json:"key"`
	Name        string   `json:"name"`
	FFmpegNames []string `json:"ffmpegNames"` // as reported by ffprobe format.format_name
	Extensions  []string `json:"extensions"`
	MIMETypes   []string `json:"mimeTypes,omitempty"`
	Kind        Kind     `json:"kind"`
	Family      Family   `json:"family"`
	// VideoCodecs / AudioCodecs are the legal mux targets; empty means unrestricted.
	VideoCodecs []string `json:"videoCodecs,omitempty"`
	AudioCodecs []string `json:"audioCodecs,omitempty"`
	// SupportsAlpha marks containers that can carry a transparent video track.
	SupportsAlpha bool `json:"supportsAlpha"`
	// Seekless containers cannot reliably report a duration (raw streams, some retro).
	Seekless bool `json:"seekless"`
}

// Codec describes an encoder/decoder pair, including sub-formats and profiles.
type Codec struct {
	Key         string   `json:"key"`
	Name        string   `json:"name"`
	Kind        Kind     `json:"kind"`
	Family      Family   `json:"family"`
	FFmpegNames []string `json:"ffmpegNames"`
	// Encoders lists cgo-visible encoder ids in preference order (first wins).
	Encoders []string `json:"encoders,omitempty"`
	// Decoders lists decoder ids; empty means the encoder id also decodes.
	Decoders []string `json:"decoders,omitempty"`
	Profiles []string `json:"profiles,omitempty"`
	// SubFormats are the named variants a container may carry, e.g. ProRes 422 HQ.
	SubFormats []string `json:"subFormats,omitempty"`
	// Lossy is false for bit-exact codecs, used to skip unnecessary re-encode passes.
	Lossy bool `json:"lossy"`
	// DefaultBitrate and DefaultCRF seed the adaptive size limiter.
	DefaultBitrate int `json:"defaultBitrate,omitempty"`
	DefaultCRF     int `json:"defaultCrf,omitempty"`
	// Channels 0 means unmixed; 1 mono, 2 stereo, N for surround.
	Channels int `json:"channels,omitempty"`
}

// PixelFormat is a sample layout the filter graph may need to negotiate.
type PixelFormat struct {
	Name       string `json:"name"`
	BitDepth   int    `json:"bitDepth"`
	Components string `json:"components"` // yuv / rgb / gray / palette
	Alpha      bool   `json:"alpha"`
}

// ---------------------------------------------------------------------------
// Containers
// ---------------------------------------------------------------------------

func containers() []Container {
	return []Container{
		// Modern web & mobile
		{Key: "mp4", Name: "MP4", FFmpegNames: []string{"mp4", "mov,mp4,m4a,3gp,3g2,mj2"}, Extensions: []string{".mp4", ".m4v", ".m4a", ".mov"}, Kind: KindVideo, Family: FamilyModern, VideoCodecs: []string{"h264", "hevc", "av1", "mpeg4", "prores", "dnxhd", "jpeg"}, AudioCodecs: []string{"aac", "mp3", "alac", "flac", "opus", "ac3", "eac3", "dts", "pcm_s16le"}},
		// The first entry of each list is the default the converter picks when the
		// caller names only a container, so order is a product decision: WebM means
		// VP9+Opus here, which is what the UI advertises and what the sticker packs
		// require. VP8 stays legal, it is simply no longer the implicit choice.
		{Key: "webm", Name: "WebM", FFmpegNames: []string{"webm", "matroska,webm"}, Extensions: []string{".webm"}, Kind: KindVideo, Family: FamilyModern, VideoCodecs: []string{"vp9", "vp8", "av1"}, AudioCodecs: []string{"opus", "vorbis"}, SupportsAlpha: true},
		{Key: "mkv", Name: "Matroska", FFmpegNames: []string{"matroska"}, Extensions: []string{".mkv", ".mka"}, Kind: KindVideo, Family: FamilyModern, VideoCodecs: []string{"h264", "hevc", "av1", "vp8", "vp9", "prores", "dnxhd", "ffv1", "mpeg2video", "theora"}, AudioCodecs: []string{"aac", "mp3", "vorbis", "opus", "flac", "alac", "ac3", "eac3", "dts", "truehd", "pcm_s16le"}},
		// H.264 first: ProRes stays legal (that is what "ProRes friendly" means) but
		// defaulting to it turned a 100 KB clip into a 2 MB file, which is the
		// opposite of what a converter should do when handed only a container.
		{Key: "mov", Name: "QuickTime", FFmpegNames: []string{"mov"}, Extensions: []string{".mov", ".qt"}, Kind: KindVideo, Family: FamilyModern, VideoCodecs: []string{"h264", "prores", "hevc", "jpeg", "png", "dnxhd"}, AudioCodecs: []string{"aac", "pcm_s16le", "alac", "mp3"}},
		{Key: "flv", Name: "Flash Video", FFmpegNames: []string{"flv"}, Extensions: []string{".flv", ".f4v"}, Kind: KindVideo, Family: FamilyModern, VideoCodecs: []string{"flv1", "svq3", "h264"}, AudioCodecs: []string{"mp3", "aac", "adpcm_swf"}, Seekless: true},
		{Key: "ogg", Name: "Ogg", FFmpegNames: []string{"ogg"}, Extensions: []string{".ogg", ".ogx"}, Kind: KindVideo, Family: FamilyModern, VideoCodecs: []string{"theora", "vp8", "av1"}, AudioCodecs: []string{"vorbis", "opus", "flac", "speex"}},
		{Key: "ogv", Name: "Ogg Theora", FFmpegNames: []string{"ogg"}, Extensions: []string{".ogv"}, Kind: KindVideo, Family: FamilyModern, VideoCodecs: []string{"theora"}, AudioCodecs: []string{"vorbis", "opus", "flac", "speex"}},
		{Key: "oga", Name: "Ogg Audio", FFmpegNames: []string{"ogg"}, Extensions: []string{".oga"}, Kind: KindAudio, Family: FamilyModern, AudioCodecs: []string{"vorbis", "opus", "flac", "speex"}},
		{Key: "opus", Name: "Ogg Opus", FFmpegNames: []string{"opus"}, Extensions: []string{".opus"}, Kind: KindAudio, Family: FamilyModern, AudioCodecs: []string{"opus"}},
		{Key: "3gp", Name: "3GPP", FFmpegNames: []string{"mov"}, Extensions: []string{".3gp", ".3g2"}, Kind: KindVideo, Family: FamilyModern, VideoCodecs: []string{"h264", "mpeg4", "h263", "av1"}, AudioCodecs: []string{"aac", "amr_nb", "amr_wb"}},
		{Key: "ts", Name: "MPEG Transport Stream", FFmpegNames: []string{"mpegts"}, Extensions: []string{".ts", ".mts", ".m2ts"}, Kind: KindVideo, Family: FamilyBroadcast, VideoCodecs: []string{"h264", "hevc", "mpeg2video", "av1"}, AudioCodecs: []string{"aac", "mp2", "mp3", "ac3", "eac3", "dts"}, Seekless: true},
		{Key: "mpegps", Name: "MPEG Program Stream", FFmpegNames: []string{"mpeg"}, Extensions: []string{".mpg", ".mpeg", ".vob", ".m2v", ".m1v"}, Kind: KindVideo, Family: FamilyBroadcast, VideoCodecs: []string{"mpeg1video", "mpeg2video", "h264"}, AudioCodecs: []string{"mp2", "mp3", "ac3"}},
		{Key: "wmv", Name: "Windows Media", FFmpegNames: []string{"asf"}, Extensions: []string{".wmv", ".asf", ".wma"}, Kind: KindVideo, Family: FamilyModern, VideoCodecs: []string{"wmv1", "wmv2", "wmv3", "vc1"}, AudioCodecs: []string{"wmav1", "wmav2", "wmapro", "mp3"}, Seekless: true},

		// Professional & broadcast
		{Key: "mxf", Name: "MXF", FFmpegNames: []string{"mxf"}, Extensions: []string{".mxf"}, Kind: KindVideo, Family: FamilyBroadcast, VideoCodecs: []string{"mpeg2video", "dnxhd", "prores", "h264", "jpeg2000"}, AudioCodecs: []string{"pcm_s16le", "aac"}},
		{Key: "gxf", Name: "GXF", FFmpegNames: []string{"gxf"}, Extensions: []string{".gxf"}, Kind: KindVideo, Family: FamilyBroadcast, VideoCodecs: []string{"mpeg2video"}, AudioCodecs: []string{"pcm_s16le"}},
		{Key: "dv", Name: "DV", FFmpegNames: []string{"dv"}, Extensions: []string{".dv"}, Kind: KindVideo, Family: FamilyBroadcast, VideoCodecs: []string{"dvvideo"}, AudioCodecs: []string{"pcm_s16le"}},
		{Key: "nut", Name: "NUT", FFmpegNames: []string{"nut"}, Extensions: []string{".nut"}, Kind: KindVideo, Family: FamilyLossless, VideoCodecs: []string{"ffv1", "xvid", "h264"}, AudioCodecs: []string{"ffv1", "aac", "mp3"}, SupportsAlpha: true},
		{Key: "ogm", Name: "Ogg Media", FFmpegNames: []string{"ogg"}, Extensions: []string{".ogm"}, Kind: KindVideo, Family: FamilyModern, VideoCodecs: []string{"theora", "divx", "xvid"}, AudioCodecs: []string{"vorbis", "mp3", "flac"}},
		{Key: "avi", Name: "Audio Video Interleave", FFmpegNames: []string{"avi"}, Extensions: []string{".avi"}, Kind: KindVideo, Family: FamilyModern, VideoCodecs: []string{"mpeg4", "h264", "mjpeg", "ffvhuff", "utvideo", "lagarith", "cinepak", "indeo5", "wmv1", "wmv2", "flv1", "msvideo1"}, AudioCodecs: []string{"mp3", "pcm_s16le", "adpcm_ima_ws", "wmav2"}},
		{Key: "realmedia", Name: "RealMedia", FFmpegNames: []string{"rm", "rtsp", "sdp"}, Extensions: []string{".rm", ".rmvb", ".ra"}, Kind: KindVideo, Family: FamilyModern, VideoCodecs: []string{"rv10", "rv20", "rv30", "rv40"}, AudioCodecs: []string{"cook", "atrc", "sipr", "ra_144", "ra_288"}, Seekless: true},
		{Key: "wtv", Name: "Windows Television", FFmpegNames: []string{"wtv"}, Extensions: []string{".wtv"}, Kind: KindVideo, Family: FamilyBroadcast, VideoCodecs: []string{"wmv3", "vc1", "h264"}, AudioCodecs: []string{"wmav2", "wmapro"}, Seekless: true},

		// Vintage & retro gaming
		{Key: "bink", Name: "Bink Video", FFmpegNames: []string{"bink"}, Extensions: []string{".bik"}, Kind: KindVideo, Family: FamilyRetro, VideoCodecs: []string{"binkaudio_dct", "binkaudio_rdft", "bink"}, AudioCodecs: []string{"binkaudio_dct", "binkaudio_rdft"}, Seekless: true},
		{Key: "smacker", Name: "Smacker", FFmpegNames: []string{"smacker"}, Extensions: []string{".smk"}, Kind: KindVideo, Family: FamilyRetro, VideoCodecs: []string{"smacker"}, AudioCodecs: []string{"pcm_u8"}, Seekless: true},
		{Key: "interplay", Name: "Interplay MVE", FFmpegNames: []string{"ipmovie", "mve"}, Extensions: []string{".mve", ".mv"}, Kind: KindVideo, Family: FamilyRetro, VideoCodecs: []string{"interplay_video"}, AudioCodecs: []string{"interplay_dpcm", "pcm_s16le"}, Seekless: true},
		{Key: "westwood", Name: "Westwood VQA", FFmpegNames: []string{"wsaud", "wsvqa"}, Extensions: []string{".vqa", ".aud", ".anim"}, Kind: KindVideo, Family: FamilyRetro, VideoCodecs: []string{"westwood_vqa"}, AudioCodecs: []string{"westwood_snd1", "adpcm_ima_ws"}, Seekless: true},
		{Key: "quake", Name: "Quake CIN", FFmpegNames: []string{"cin"}, Extensions: []string{".cin"}, Kind: KindVideo, Family: FamilyRetro, VideoCodecs: []string{"interplay_video"}, AudioCodecs: []string{"pcm_s16le"}, Seekless: true},
		{Key: "ea", Name: "Electronic Arts Multimedia", FFmpegNames: []string{"ea", "cvg"}, Extensions: []string{".cmv", ".mad", ".str", ".asf_ea"}, Kind: KindVideo, Family: FamilyRetro, VideoCodecs: []string{"cmv", "tdsc", "interplay_video"}, AudioCodecs: []string{"pcm_s16le", "ea_scd", "ea_xa", "adpcm_ea"}, Seekless: true},
		{Key: "deluxe", Name: "Deluxe Paint Animation", FFmpegNames: []string{"dcstr", "faad", " anim"}, Extensions: []string{".anm"}, Kind: KindVideo, Family: FamilyRetro, VideoCodecs: []string{"deluxe_paint_animation"}, Seekless: true},
		{Key: "fli", Name: "Autodesk FLC/FLI", FFmpegNames: []string{"fli"}, Extensions: []string{".fli", ".flc"}, Kind: KindImage, Family: FamilyRetro, VideoCodecs: []string{"flic"}, Seekless: true},

		// Audio-only
		{Key: "wav", Name: "Wave", FFmpegNames: []string{"wav"}, Extensions: []string{".wav"}, Kind: KindAudio, Family: FamilyLossless, AudioCodecs: []string{"pcm_s16le", "pcm_s24le", "pcm_f32le", "adpcm_ima_wav", "mp3", "alac"}},
		{Key: "aiff", Name: "AIFF", FFmpegNames: []string{"aiff"}, Extensions: []string{".aiff", ".aif", ".afc"}, Kind: KindAudio, Family: FamilyLossless, AudioCodecs: []string{"pcm_s16be", "pcm_f32be", "alac"}},
		{Key: "mp3", Name: "MP3", FFmpegNames: []string{"mp3"}, Extensions: []string{".mp3"}, Kind: KindAudio, Family: FamilyModern, AudioCodecs: []string{"mp3"}},
		{Key: "m4a", Name: "M4A / AAC", FFmpegNames: []string{"mp4"}, Extensions: []string{".m4a", ".aac", ".m4b"}, Kind: KindAudio, Family: FamilyModern, AudioCodecs: []string{"aac", "alac"}},
		{Key: "flac", Name: "FLAC", FFmpegNames: []string{"flac"}, Extensions: []string{".flac"}, Kind: KindAudio, Family: FamilyAudiophile, AudioCodecs: []string{"flac"}},
		{Key: "wma", Name: "Windows Media Audio", FFmpegNames: []string{"asf"}, Extensions: []string{".wma"}, Kind: KindAudio, Family: FamilyModern, AudioCodecs: []string{"wmav1", "wmav2", "wmapro", "wmavoice"}, Seekless: true},
		{Key: "mpc", Name: "Musepack", FFmpegNames: []string{"mpc", "mpc8"}, Extensions: []string{".mpc", ".mp+", ".mpp"}, Kind: KindAudio, Family: FamilyAudiophile, AudioCodecs: []string{"mpc7", "mpc8"}, Seekless: true},
		{Key: "vqf", Name: "TwinVQ", FFmpegNames: []string{"vqf"}, Extensions: []string{".vqf"}, Kind: KindAudio, Family: FamilySpeech, AudioCodecs: []string{"twinvq"}, Seekless: true},
		{Key: "ape", Name: "Monkey's Audio", FFmpegNames: []string{"ape"}, Extensions: []string{".ape"}, Kind: KindAudio, Family: FamilyAudiophile, AudioCodecs: []string{"ape"}, Seekless: true},
		{Key: "wv", Name: "WavPack", FFmpegNames: []string{"wavpack"}, Extensions: []string{".wv"}, Kind: KindAudio, Family: FamilyAudiophile, AudioCodecs: []string{"wavpack"}},
		{Key: "tta", Name: "True Audio", FFmpegNames: []string{"tta"}, Extensions: []string{".tta"}, Kind: KindAudio, Family: FamilyAudiophile, AudioCodecs: []string{"tta"}},
		{Key: "tak", Name: "TAK", FFmpegNames: []string{"tak"}, Extensions: []string{".tak"}, Kind: KindAudio, Family: FamilyAudiophile, AudioCodecs: []string{"tak"}, Seekless: true},
		{Key: "shn", Name: "Shorten", FFmpegNames: []string{"shorten"}, Extensions: []string{".shn"}, Kind: KindAudio, Family: FamilyAudiophile, AudioCodecs: []string{"shorten"}, Seekless: true},
		{Key: "amr", Name: "AMR", FFmpegNames: []string{"amr"}, Extensions: []string{".amr", ".awb"}, Kind: KindAudio, Family: FamilySpeech, AudioCodecs: []string{"amr_nb", "amr_wb"}, Seekless: true},
		{Key: "voc", Name: "Creative Voice", FFmpegNames: []string{"voc"}, Extensions: []string{".voc"}, Kind: KindAudio, Family: FamilyRetro, AudioCodecs: []string{"pcm_u8", "adpcm_ct"}, Seekless: true},
		{Key: "au", Name: "Sun Audio", FFmpegNames: []string{"au"}, Extensions: []string{".au", ".snd"}, Kind: KindAudio, Family: FamilyRetro, AudioCodecs: []string{"pcm_s16be", "ulaw", "alaw", "adpcm_g726le"}, Seekless: true},

		// Still images & animation
		{Key: "webp", Name: "WebP", FFmpegNames: []string{"webp", "webp_pipe"}, Extensions: []string{".webp"}, Kind: KindImage, Family: FamilyModern, VideoCodecs: []string{"webp"}, SupportsAlpha: true},
		{Key: "avif", Name: "AVIF", FFmpegNames: []string{"avif"}, Extensions: []string{".avif", ".avs"}, Kind: KindImage, Family: FamilyModern, VideoCodecs: []string{"av1"}, SupportsAlpha: true},
		{Key: "heif", Name: "HEIC / HEIF", FFmpegNames: []string{"heif"}, Extensions: []string{".heic", ".heif"}, Kind: KindImage, Family: FamilyModern, VideoCodecs: []string{"hevc"}, SupportsAlpha: true},
		{Key: "jxl", Name: "JPEG XL", FFmpegNames: []string{"jxl"}, Extensions: []string{".jxl"}, Kind: KindImage, Family: FamilyModern, VideoCodecs: []string{"jxl"}, SupportsAlpha: true},
		{Key: "png", Name: "PNG", FFmpegNames: []string{"png", "apng"}, Extensions: []string{".png"}, Kind: KindImage, Family: FamilyLossless, VideoCodecs: []string{"png"}, SupportsAlpha: true},
		{Key: "jpeg", Name: "JPEG", FFmpegNames: []string{"jpeg"}, Extensions: []string{".jpg", ".jpeg", ".jpe", ".jfif"}, Kind: KindImage, Family: FamilyModern, VideoCodecs: []string{"mjpeg"}},
		{Key: "gif", Name: "GIF", FFmpegNames: []string{"gif"}, Extensions: []string{".gif"}, Kind: KindImage, Family: FamilyModern, VideoCodecs: []string{"gif"}, SupportsAlpha: true},
		{Key: "bmp", Name: "BMP", FFmpegNames: []string{"bmp"}, Extensions: []string{".bmp", ".dib"}, Kind: KindImage, Family: FamilyLossless, VideoCodecs: []string{"bmp"}, SupportsAlpha: true},
		{Key: "tiff", Name: "TIFF", FFmpegNames: []string{"tiff"}, Extensions: []string{".tif", ".tiff"}, Kind: KindImage, Family: FamilyLossless, VideoCodecs: []string{"tiff"}, SupportsAlpha: true},
		{Key: "tga", Name: "Targa", FFmpegNames: []string{"image2"}, Extensions: []string{".tga"}, Kind: KindImage, Family: FamilyLossless, VideoCodecs: []string{"targa"}, SupportsAlpha: true},
		{Key: "ico", Name: "ICO", FFmpegNames: []string{"ico"}, Extensions: []string{".ico", ".cur"}, Kind: KindImage, Family: FamilyModern, VideoCodecs: []string{"png"}, SupportsAlpha: true},
		{Key: "dds", Name: "DirectDraw Surface", FFmpegNames: []string{"dds"}, Extensions: []string{".dds"}, Kind: KindImage, Family: FamilyLossless, VideoCodecs: []string{"dds"}, SupportsAlpha: true},
		{Key: "psd", Name: "Photoshop", FFmpegNames: []string{"psd"}, Extensions: []string{".psd"}, Kind: KindImage, Family: FamilyLossless, VideoCodecs: []string{"psd"}, SupportsAlpha: true},
		{Key: "exr", Name: "OpenEXR", FFmpegNames: []string{"exr"}, Extensions: []string{".exr"}, Kind: KindImage, Family: FamilyLossless, VideoCodecs: []string{"exr"}, SupportsAlpha: true},
		{Key: "dpx", Name: "DPX", FFmpegNames: []string{"image2"}, Extensions: []string{".dpx"}, Kind: KindImage, Family: FamilyLossless, VideoCodecs: []string{"dpx"}},
		{Key: "hdr", Name: "Radiance HDR", FFmpegNames: []string{"hdr"}, Extensions: []string{".hdr", ".pic"}, Kind: KindImage, Family: FamilyLossless, VideoCodecs: []string{"hdr"}},
		{Key: "fits", Name: "FITS", FFmpegNames: []string{"fits"}, Extensions: []string{".fits"}, Kind: KindImage, Family: FamilyLossless, VideoCodecs: []string{"fits"}},
		{Key: "sgi", Name: "SGI Image", FFmpegNames: []string{"sgi"}, Extensions: []string{".rgb", ".bw", ".sgi"}, Kind: KindImage, Family: FamilyLossless, VideoCodecs: []string{"sgi"}, SupportsAlpha: true},
		{Key: "ras", Name: "Sun Raster", FFmpegNames: []string{"sunrast"}, Extensions: []string{".ras", ".sun"}, Kind: KindImage, Family: FamilyRetro, VideoCodecs: []string{"sunrast"}, SupportsAlpha: true},
		{Key: "jpeg2000", Name: "JPEG 2000", FFmpegNames: []string{"image2"}, Extensions: []string{".jp2", ".j2k"}, Kind: KindImage, Family: FamilyLossless, VideoCodecs: []string{"jpeg2000"}, SupportsAlpha: true},
	}
}

// ---------------------------------------------------------------------------
// Codecs
// ---------------------------------------------------------------------------

func codecs() []Codec {
	return []Codec{
		// --- Video: next generation -------------------------------------------------
		{Key: "av1", Name: "AV1", Kind: KindVideo, Family: FamilyModern, Lossy: true, DefaultCRF: 30,
			FFmpegNames: []string{"libaom-av1", "libsvtav1", "librav1e", "rav1e", "av1"},
			Encoders:    []string{"libsvtav1", "libaom-av1", "rav1e", "av1", "av1_mediacodec"},
			Decoders:    []string{"av1", "libaom-av1", "wmmavmap", "dav1d"},
			Profiles:    []string{"Main 8-bit 4:0:0", "Main 10-bit 4:0:0", "High 10-bit 4:4:4"},
			SubFormats:  []string{"libaom", "libsvtav1", "rav1e"}},
		{Key: "hevc", Name: "H.265 / HEVC", Kind: KindVideo, Family: FamilyModern, Lossy: true, DefaultCRF: 26,
			FFmpegNames: []string{"hevc", "libx265", "hevc_nvenc", "hevc_amf", "hevc_qsv", "hevc_videotoolbox"},
			Encoders:    []string{"libx265", "hevc_nvenc", "hevc_amf", "hevc_qsv", "hevc_videotoolbox", "hevc_mediacodec", "hevc"},
			Decoders:    []string{"hevc"},
			Profiles:    []string{"Main", "Main 10", "Main Still Picture", "Rext", "Range Extensions"},
			SubFormats:  []string{"Main", "Main10", "Main Still"}},
		{Key: "vvc", Name: "VVC / H.266", Kind: KindVideo, Family: FamilyModern, Lossy: true, DefaultCRF: 28,
			FFmpegNames: []string{"vvc", "libvvc", "vvcenc"},
			Encoders:    []string{"vvc", "libvvc"},
			Decoders:    []string{"vvc"}},

		// --- Video: industry standard ------------------------------------------------
		{Key: "h264", Name: "H.264 / AVC", Kind: KindVideo, Family: FamilyModern, Lossy: true, DefaultCRF: 21,
			FFmpegNames: []string{"h264", "libx264", "h264_nvenc", "h264_amf", "h264_qsv", "libopenh264"},
			Encoders:    []string{"libx264", "h264_nvenc", "h264_amf", "h264_qsv", "libopenh264", "h264_mediacodec", "h264"},
			Decoders:    []string{"h264"},
			Profiles:    []string{"Baseline", "Constrained Baseline", "Main", "Extended", "High", "High 10", "High 4:2:2", "High 4:4:4 Predictive"},
			SubFormats:  []string{"Baseline", "Main", "High", "High10", "High422", "High444"}},
		{Key: "vp8", Name: "VP8", Kind: KindVideo, Family: FamilyModern, Lossy: true, DefaultCRF: 30,
			FFmpegNames: []string{"vp8", "libvpx"},
			Encoders:    []string{"libvpx", "vp8_mediacodec", "vp8"},
			Decoders:    []string{"vp8"}},
		{Key: "vp9", Name: "VP9", Kind: KindVideo, Family: FamilyModern, Lossy: true, DefaultCRF: 32,
			FFmpegNames: []string{"vp9", "libvpx-vp9"},
			Encoders:    []string{"libvpx-vp9", "vp9_mediacodec", "vp9"},
			Decoders:    []string{"vp9"},
			Profiles:    []string{"Profile 0 4:2:0 8-bit", "Profile 1 4:4:4 8-bit", "Profile 2 4:2:0 10-bit", "Profile 3 4:4:4 10-bit"},
			SubFormats:  []string{"Profile0", "Profile1", "Profile2", "Profile3"}},
		{Key: "theora", Name: "Ogg Theora", Kind: KindVideo, Family: FamilyModern, Lossy: true, DefaultCRF: 32,
			FFmpegNames: []string{"theora", "libtheora"},
			Encoders:    []string{"libtheora", "theora"},
			Decoders:    []string{"theora"}},

		// --- Video: mastering & editing intermediates --------------------------------
		{Key: "prores", Name: "Apple ProRes", Kind: KindVideo, Family: FamilyLossless, Lossy: true, DefaultCRF: 0,
			FFmpegNames: []string{"prores", "prores_ks", "prores_raw"},
			Encoders:    []string{"prores_ks", "prores"},
			Decoders:    []string{"prores", "prores_raw"},
			SubFormats:  []string{"422 Proxy", "422 LT", "422", "422 HQ", "4444", "4444 XQ"},
			Profiles:    []string{"0 proxy", "1 lt", "2 standard", "3 hq", "4 4444", "5 4444xq"}},
		{Key: "dnxhd", Name: "Avid DNxHD", Kind: KindVideo, Family: FamilyLossless, Lossy: true,
			FFmpegNames: []string{"dnxhd", "dnxhd_parser"}, Encoders: []string{"dnxhd"}, Decoders: []string{"dnxhd"}},
		{Key: "dnxhr", Name: "Avid DNxHR", Kind: KindVideo, Family: FamilyLossless, Lossy: true,
			FFmpegNames: []string{"dnxhd", "dnxhr"}, Encoders: []string{"dnxhd"}, Decoders: []string{"dnxhd"},
			SubFormats: []string{"LB", "SQ", "HQ", "HQX", "444", "444 XQ"}},
		{Key: "cfhd", Name: "GoPro CineForm", Kind: KindVideo, Family: FamilyLossless, Lossy: true,
			FFmpegNames: []string{"cfhd"}, Decoders: []string{"cfhd"}},
		{Key: "hq", Name: "Grass Valley Canopus HQ/HQX", Kind: KindVideo, Family: FamilyLossless, Lossy: true,
			FFmpegNames: []string{"hq_hqa", "hqa"}, Decoders: []string{"hq_hqa"}},

		// --- Video: pure lossless -----------------------------------------------------
		{Key: "ffv1", Name: "FFV1", Kind: KindVideo, Family: FamilyLossless, Lossy: false,
			FFmpegNames: []string{"ffv1"}, Encoders: []string{"ffv1"}, Decoders: []string{"ffv1"},
			SubFormats: []string{"version 1", "version 3 multithreaded"}},
		{Key: "huffyuv", Name: "Huffyuv", Kind: KindVideo, Family: FamilyLossless, Lossy: false,
			FFmpegNames: []string{"huffyuv", "ffvhuff"}, Encoders: []string{"ffvhuff", "huffyuv"}, Decoders: []string{"huffyuv", "ffvhuff"}},
		{Key: "magicyuv", Name: "MagicYUV", Kind: KindVideo, Family: FamilyLossless, Lossy: false,
			FFmpegNames: []string{"magicyuv"}, Decoders: []string{"magicyuv"}, SubFormats: []string{"Y8", "YUV555", "RGB5", "RGB8", "HUFFYUV_V2", "HUFFYUV_V3"}},
		{Key: "utvideo", Name: "Ut Video", Kind: KindVideo, Family: FamilyLossless, Lossy: false,
			FFmpegNames: []string{"utvideo"}, Encoders: []string{"utvideo"}, Decoders: []string{"utvideo"}},
		{Key: "lagarith", Name: "Lagarith", Kind: KindVideo, Family: FamilyLossless, Lossy: false,
			FFmpegNames: []string{"lagarith"}, Decoders: []string{"lagarith"}},

		// --- Video: legacy, screen & retro --------------------------------------------
		{Key: "mpeg1video", Name: "MPEG-1 Video", Kind: KindVideo, Family: FamilyBroadcast, Lossy: true, DefaultCRF: 23,
			FFmpegNames: []string{"mpeg1video"}, Encoders: []string{"mpeg1video"}, Decoders: []string{"mpeg1video"}},
		{Key: "mpeg2video", Name: "MPEG-2 Video", Kind: KindVideo, Family: FamilyBroadcast, Lossy: true, DefaultCRF: 22,
			FFmpegNames: []string{"mpeg2video", "mpeg2_qsv"}, Encoders: []string{"mpeg2video"}, Decoders: []string{"mpeg2video"}},
		{Key: "mpeg4", Name: "MPEG-4 Part 2 (Xvid/DivX)", Kind: KindVideo, Family: FamilyModern, Lossy: true, DefaultCRF: 24,
			FFmpegNames: []string{"mpeg4", "libxvid"}, Encoders: []string{"libxvid", "mpeg4_mediacodec", "mpeg4"}, Decoders: []string{"mpeg4"},
			SubFormats: []string{"Xvid", "DivX 4", "DivX 5"}},
		{Key: "flv1", Name: "Sorenson Spark", Kind: KindVideo, Family: FamilyModern, Lossy: true,
			FFmpegNames: []string{"flv"}, Encoders: []string{"flv"}, Decoders: []string{"flv"}},
		{Key: "svq3", Name: "Sorenson Video 3", Kind: KindVideo, Family: FamilyRetro, Lossy: true,
			FFmpegNames: []string{"svq3"}, Decoders: []string{"svq3"}},
		{Key: "rv10", Name: "RealVideo 1", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"rv10"}, Decoders: []string{"rv10"}},
		{Key: "rv20", Name: "RealVideo 2", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"rv20"}, Decoders: []string{"rv20"}},
		{Key: "rv30", Name: "RealVideo 3", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"rv30"}, Decoders: []string{"rv30"}},
		{Key: "rv40", Name: "RealVideo 4", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"rv40"}, Decoders: []string{"rv40"}},
		{Key: "cinepak", Name: "Cinepak", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"cinepak"}, Encoders: []string{"cinepak"}, Decoders: []string{"cinepak"}},
		{Key: "indeo2", Name: "Intel Indeo 2", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"indeo2"}, Decoders: []string{"indeo2"}},
		{Key: "indeo3", Name: "Intel Indeo 3", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"indeo3"}, Decoders: []string{"indeo3"}},
		{Key: "indeo4", Name: "Intel Indeo 4", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"indeo4"}, Decoders: []string{"indeo4"}},
		{Key: "indeo5", Name: "Intel Indeo 5", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"indeo5"}, Decoders: []string{"indeo5"}},
		{Key: "msmpeg4v1", Name: "MS MPEG-4 v1", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"msmpeg4v1"}, Decoders: []string{"msmpeg4v1"}},
		{Key: "msmpeg4v2", Name: "MS MPEG-4 v2", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"msmpeg4v2"}, Decoders: []string{"msmpeg4v2"}},
		{Key: "msmpeg4v3", Name: "MS MPEG-4 v3", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"msmpeg4"}, Decoders: []string{"msmpeg4"}},
		{Key: "msvideo1", Name: "Microsoft Video 1", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"msmpeg4v3", "cram"}, Encoders: []string{"msmpeg4"}, Decoders: []string{"msmpeg4"}},
		{Key: "flashsv", Name: "Flash Screen Video v1", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"flashsv"}, Encoders: []string{"flashsv"}, Decoders: []string{"flashsv"}},
		{Key: "flashsv2", Name: "Flash Screen Video v2", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"flashsv2"}, Encoders: []string{"flashsv2"}, Decoders: []string{"flashsv2"}},
		{Key: "cscd", Name: "CamStudio", Kind: KindVideo, Family: FamilyRetro, Lossy: false, FFmpegNames: []string{"camstudio"}, Decoders: []string{"camstudio"}},
		{Key: "mjpeg", Name: "Motion JPEG", Kind: KindVideo, Family: FamilyLossless, Lossy: true, DefaultCRF: 2,
			FFmpegNames: []string{"mjpeg", "jpeg_ls"}, Encoders: []string{"mjpeg"}, Decoders: []string{"mjpeg"}},
		{Key: "mjpegb", Name: "Apple MJPEG-B", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"mjpegb"}, Decoders: []string{"mjpegb"}},
		{Key: "tscc", Name: "TechSmith Screen Capture", Kind: KindVideo, Family: FamilyRetro, Lossy: false, FFmpegNames: []string{"tscc", "tdsc"}, Decoders: []string{"tscc"}},
		{Key: "g2m", Name: "Go2Meeting", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"g2m"}, Decoders: []string{"g2m"}},
		{Key: "h263", Name: "H.263", Kind: KindVideo, Family: FamilySpeech, Lossy: true, FFmpegNames: []string{"h263", "flv"}, Encoders: []string{"h263"}, Decoders: []string{"h263"}},
		{Key: "dvvideo", Name: "DV", Kind: KindVideo, Family: FamilyBroadcast, Lossy: true, FFmpegNames: []string{"dvvideo"}, Encoders: []string{"dvvideo"}, Decoders: []string{"dvvideo"}},
		{Key: "vc1", Name: "VC-1 / WMV3", Kind: KindVideo, Family: FamilyBroadcast, Lossy: true, FFmpegNames: []string{"vc1", "wmv3"}, Decoders: []string{"vc1", "wmv3"}},
		{Key: "wmv1", Name: "Windows Media Video 7", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"wmv1"}, Encoders: []string{"wmv1"}, Decoders: []string{"wmv1"}},
		{Key: "wmv2", Name: "Windows Media Video 8", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"wmv2"}, Encoders: []string{"wmv2"}, Decoders: []string{"wmv2"}},

		// --- Retro game codecs ---------------------------------------------------------
		{Key: "bink", Name: "Bink Video", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"bink"}, Decoders: []string{"bink"}},
		{Key: "smacker", Name: "Smacker", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"smacker"}, Decoders: []string{"smacker"}},
		{Key: "interplay_video", Name: "Interplay / Westwood Video", Kind: KindVideo, Family: FamilyRetro, Lossy: true,
			FFmpegNames: []string{"interplay_video", "mimic", "westwood_vqa", "tdsc", "cmv", "deluxe_paint_animation"},
			Decoders:    []string{"interplay_video", "westwood_vqa", "cmv", "deluxe_paint_animation", "turk"},
			Profiles:    []string{"mve", "vqa", "cin", "cmv", "anm"}},
		{Key: "flic", Name: "Autodesk FLIC", Kind: KindVideo, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"flic"}, Decoders: []string{"flic"}},

		// --- Image codecs ---------------------------------------------------------------
		{Key: "webp", Name: "WebP image", Kind: KindImage, Family: FamilyModern, Lossy: true, DefaultCRF: 75,
			FFmpegNames: []string{"webp", "libwebp_anim"}, Encoders: []string{"libwebp", "webp"}, Decoders: []string{"webp"},
			SubFormats: []string{"lossy", "lossless", "alpha", "animated"}},
		{Key: "jxl", Name: "JPEG XL", Kind: KindImage, Family: FamilyModern, Lossy: true,
			FFmpegNames: []string{"jxl", "pegasos", "libjxl"}, Encoders: []string{"libjxl", "jxl"}, Decoders: []string{"jxl"}},
		{Key: "png", Name: "PNG", Kind: KindImage, Family: FamilyLossless, Lossy: false,
			FFmpegNames: []string{"png"}, Encoders: []string{"png", "apng"}, Decoders: []string{"png", "apng"},
			SubFormats: []string{"PNG8 indexed", "PNG24", "PNG32 RGBA", "APNG"}},
		{Key: "gif", Name: "GIF", Kind: KindImage, Family: FamilyModern, Lossy: true,
			FFmpegNames: []string{"gif"}, Encoders: []string{"gif"}, Decoders: []string{"gif"},
			SubFormats: []string{"static", "animated"}},
		{Key: "bmp", Name: "BMP", Kind: KindImage, Family: FamilyLossless, Lossy: false, FFmpegNames: []string{"bmp"}, Encoders: []string{"bmp"}, Decoders: []string{"bmp"},
			SubFormats: []string{"1bpp", "4bpp", "8bpp", "16bpp", "24bpp", "32bpp"}},
		{Key: "tiff", Name: "TIFF", Kind: KindImage, Family: FamilyLossless, Lossy: false, FFmpegNames: []string{"tiff"}, Encoders: []string{"tiff"}, Decoders: []string{"tiff"}},
		{Key: "targa", Name: "Targa", Kind: KindImage, Family: FamilyLossless, Lossy: false, FFmpegNames: []string{"targa"}, Encoders: []string{"targa"}, Decoders: []string{"targa"}},
		{Key: "psd", Name: "Photoshop PSD", Kind: KindImage, Family: FamilyLossless, Lossy: false, FFmpegNames: []string{"psd"}, Decoders: []string{"psd"}},
		{Key: "dds", Name: "DDS", Kind: KindImage, Family: FamilyLossless, Lossy: false, FFmpegNames: []string{"dds"}, Decoders: []string{"dds"}, SubFormats: []string{"DXT1", "DXT3", "DXT5", "BC4", "BC5", "ATI1", "ATI2"}},
		{Key: "exr", Name: "OpenEXR", Kind: KindImage, Family: FamilyLossless, Lossy: false, FFmpegNames: []string{"exr"}, Encoders: []string{"exr"}, Decoders: []string{"exr"}},
		{Key: "dpx", Name: "DPX", Kind: KindImage, Family: FamilyLossless, Lossy: false, FFmpegNames: []string{"dpx"}, Encoders: []string{"dpx"}, Decoders: []string{"dpx"}},
		{Key: "hdr", Name: "Radiance HDR", Kind: KindImage, Family: FamilyLossless, Lossy: false, FFmpegNames: []string{"hdr"}, Encoders: []string{"hdr"}, Decoders: []string{"hdr"}},
		{Key: "fits", Name: "FITS", Kind: KindImage, Family: FamilyLossless, Lossy: false, FFmpegNames: []string{"fits"}, Encoders: []string{"fits"}, Decoders: []string{"fits"}},
		{Key: "sgi", Name: "SGI", Kind: KindImage, Family: FamilyLossless, Lossy: false, FFmpegNames: []string{"sgi"}, Encoders: []string{"sgi"}, Decoders: []string{"sgi"}},
		{Key: "sunrast", Name: "Sun Raster", Kind: KindImage, Family: FamilyRetro, Lossy: false, FFmpegNames: []string{"sunrast"}, Encoders: []string{"sunrast"}, Decoders: []string{"sunrast"}},
		{Key: "jpeg2000", Name: "JPEG 2000", Kind: KindImage, Family: FamilyLossless, Lossy: true, FFmpegNames: []string{"jpeg2000", "jpeg2000ls"}, Encoders: []string{"jpeg2000"}, Decoders: []string{"jpeg2000"}},
		{Key: "hevc_image", Name: "HEVC still (HEIF)", Kind: KindImage, Family: FamilyModern, Lossy: true, FFmpegNames: []string{"hevc"}, Encoders: []string{"libx265"}, Decoders: []string{"hevc"}},

		// --- Audio: streaming & consumer ------------------------------------------------
		{Key: "mp3", Name: "MP3", Kind: KindAudio, Family: FamilyModern, Lossy: true, DefaultBitrate: 192000,
			FFmpegNames: []string{"mp3", "libmp3lame", "mp3_mf"},
			Encoders:    []string{"libmp3lame", "mp3"},
			Decoders:    []string{"mp3", "mp3float"},
			SubFormats:  []string{"CBR 32k-320k", "VBR V0-V9", "ABR"},
			Profiles:    []string{"MPEG-1 Layer III", "MPEG-2 Layer III", "MPEG-2.5 Layer III"}},
		{Key: "aac", Name: "AAC", Kind: KindAudio, Family: FamilyModern, Lossy: true, DefaultBitrate: 128000,
			FFmpegNames: []string{"aac", "libfdk_aac", "libvo_amrwbenc"},
			Encoders:    []string{"libfdk_aac", "aac", "atrac3plus"},
			Decoders:    []string{"aac", "aac_fixed", "aac_latm", "libfdk_aac"},
			SubFormats:  []string{"AAC-LC", "HE-AAC v1", "HE-AAC v2", "AAC-LD", "AAC-ELD"}},
		{Key: "vorbis", Name: "Ogg Vorbis", Kind: KindAudio, Family: FamilyModern, Lossy: true, DefaultBitrate: 160000,
			FFmpegNames: []string{"vorbis", "libvorbis"}, Encoders: []string{"libvorbis", "vorbis"}, Decoders: []string{"vorbis"}},
		{Key: "opus", Name: "Opus", Kind: KindAudio, Family: FamilyModern, Lossy: true, DefaultBitrate: 128000,
			FFmpegNames: []string{"opus", "libopus"}, Encoders: []string{"libopus", "opus"}, Decoders: []string{"opus"}},
		{Key: "wmav1", Name: "Windows Media Audio v1", Kind: KindAudio, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"wmav1"}, Decoders: []string{"wmav1"}},
		{Key: "wmav2", Name: "Windows Media Audio v2", Kind: KindAudio, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"wmav2"}, Decoders: []string{"wmav2"}},
		{Key: "wmapro", Name: "WMA Pro", Kind: KindAudio, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"wmapro"}, Decoders: []string{"wmapro"}},
		{Key: "wmavoice", Name: "WMA Voice", Kind: KindAudio, Family: FamilySpeech, Lossy: true, FFmpegNames: []string{"wmavoice"}, Decoders: []string{"wmavoice"}},
		{Key: "mpc7", Name: "Musepack SV7", Kind: KindAudio, Family: FamilyAudiophile, Lossy: true, FFmpegNames: []string{"mpc7"}, Decoders: []string{"mpc7"}},
		{Key: "mpc8", Name: "Musepack SV8", Kind: KindAudio, Family: FamilyAudiophile, Lossy: true, FFmpegNames: []string{"mpc8"}, Decoders: []string{"mpc8"}},
		{Key: "twinvq", Name: "TwinVQ", Kind: KindAudio, Family: FamilySpeech, Lossy: true, FFmpegNames: []string{"twinvq"}, Decoders: []string{"twinvq"}},

		// --- Audio: surround & cinema ----------------------------------------------------
		{Key: "ac3", Name: "AC-3 / Dolby Digital", Kind: KindAudio, Family: FamilyModern, Lossy: true, DefaultBitrate: 384000, Channels: 6,
			FFmpegNames: []string{"ac3", "eac3"}, Encoders: []string{"ac3", "eac3"}, Decoders: []string{"ac3", "eac3"}},
		{Key: "eac3", Name: "E-AC-3 / Dolby Digital Plus", Kind: KindAudio, Family: FamilyModern, Lossy: true, DefaultBitrate: 448000, Channels: 8,
			FFmpegNames: []string{"eac3"}, Encoders: []string{"eac3"}, Decoders: []string{"eac3"}},
		{Key: "truehd", Name: "Dolby TrueHD", Kind: KindAudio, Family: FamilyAudiophile, Lossy: false, Channels: 8,
			FFmpegNames: []string{"truehd", "mlp"}, Decoders: []string{"truehd", "mlp"}},
		{Key: "dts", Name: "DTS Coherent Acoustics", Kind: KindAudio, Family: FamilyModern, Lossy: true, DefaultBitrate: 768000, Channels: 6,
			FFmpegNames: []string{"dts"}, Decoders: []string{"dts"}},
		{Key: "dts_es", Name: "DTS-ES", Kind: KindAudio, Family: FamilyModern, Lossy: true, Channels: 7, FFmpegNames: []string{"dts"}, Decoders: []string{"dts"}, SubFormats: []string{"DTS-ES Matrix 6.1", "DTS-ES Discrete 6.1"}},
		{Key: "dts_hd", Name: "DTS-HD Master Audio", Kind: KindAudio, Family: FamilyAudiophile, Lossy: false, Channels: 8, FFmpegNames: []string{"dts"}, Decoders: []string{"dts"}},

		// --- Audio: archival lossless -----------------------------------------------------
		{Key: "flac", Name: "FLAC", Kind: KindAudio, Family: FamilyAudiophile, Lossy: false,
			FFmpegNames: []string{"flac"}, Encoders: []string{"flac"}, Decoders: []string{"flac"}},
		{Key: "alac", Name: "Apple Lossless", Kind: KindAudio, Family: FamilyAudiophile, Lossy: false,
			FFmpegNames: []string{"alac"}, Encoders: []string{"alac"}, Decoders: []string{"alac"}},
		{Key: "ape", Name: "Monkey's Audio", Kind: KindAudio, Family: FamilyAudiophile, Lossy: false,
			FFmpegNames: []string{"ape"}, Decoders: []string{"ape"}, SubFormats: []string{"fast", "normal", "high", "extra", "insane"}},
		{Key: "wavpack", Name: "WavPack", Kind: KindAudio, Family: FamilyAudiophile, Lossy: false,
			FFmpegNames: []string{"wavpack"}, Encoders: []string{"wavpack"}, Decoders: []string{"wavpack"}},
		{Key: "tta", Name: "True Audio", Kind: KindAudio, Family: FamilyAudiophile, Lossy: false,
			FFmpegNames: []string{"tta"}, Decoders: []string{"tta"}},
		{Key: "tak", Name: "TAK", Kind: KindAudio, Family: FamilyAudiophile, Lossy: false,
			FFmpegNames: []string{"tak"}, Decoders: []string{"tak"}},
		{Key: "shorten", Name: "Shorten", Kind: KindAudio, Family: FamilyAudiophile, Lossy: false,
			FFmpegNames: []string{"shorten"}, Decoders: []string{"shorten"}},
		{Key: "mlp", Name: "Meridian Lossless Packing", Kind: KindAudio, Family: FamilyAudiophile, Lossy: false,
			FFmpegNames: []string{"mlp", "truehd"}, Decoders: []string{"mlp", "truehd"}},

		// --- Audio: low bitrate speech ----------------------------------------------------
		{Key: "amr_nb", Name: "AMR-NB", Kind: KindAudio, Family: FamilySpeech, Lossy: true, DefaultBitrate: 12200, Channels: 1,
			FFmpegNames: []string{"libopencore_amrnb", "amrnb"}, Encoders: []string{"libopencore_amrnb"}, Decoders: []string{"libopencore_amrnb", "amrnb"}},
		{Key: "amr_wb", Name: "AMR-WB", Kind: KindAudio, Family: FamilySpeech, Lossy: true, DefaultBitrate: 23050, Channels: 1,
			FFmpegNames: []string{"libvo_amrwbenc", "amrwb"}, Encoders: []string{"libvo_amrwbenc"}, Decoders: []string{"libvo_amrwbenc", "amrwb"}},
		{Key: "speex", Name: "Speex", Kind: KindAudio, Family: FamilySpeech, Lossy: true, DefaultBitrate: 21500, Channels: 1,
			FFmpegNames: []string{"libspeex", "speex"}, Encoders: []string{"libspeex"}, Decoders: []string{"libspeex", "speex"}},
		{Key: "g711", Name: "G.711", Kind: KindAudio, Family: FamilySpeech, Lossy: false, DefaultBitrate: 64000, Channels: 1,
			FFmpegNames: []string{"pcm_alaw", "pcm_mulaw"}, Encoders: []string{"pcm_alaw", "pcm_mulaw"}, Decoders: []string{"pcm_alaw", "pcm_mulaw"},
			SubFormats: []string{"a-law", "u-law"}},
		{Key: "g722", Name: "G.722", Kind: KindAudio, Family: FamilySpeech, Lossy: true, DefaultBitrate: 64000, Channels: 1,
			FFmpegNames: []string{"g723_1", "adpcm_g722"}, Decoders: []string{"adpcm_g722"}},
		{Key: "g723", Name: "G.723.1", Kind: KindAudio, Family: FamilySpeech, Lossy: true, DefaultBitrate: 6300, Channels: 1,
			FFmpegNames: []string{"g723_1"}, Decoders: []string{"g723_1"}},
		{Key: "g726", Name: "G.726 ADPCM", Kind: KindAudio, Family: FamilySpeech, Lossy: true, Channels: 1,
			FFmpegNames: []string{"adpcm_g726le", "adpcm_g726"}, Encoders: []string{"adpcm_g726le"}, Decoders: []string{"adpcm_g726le", "adpcm_g726"}},
		{Key: "g729", Name: "G.729", Kind: KindAudio, Family: FamilySpeech, Lossy: true, DefaultBitrate: 8000, Channels: 1,
			FFmpegNames: []string{"g729"}, Decoders: []string{"g729"}},
		{Key: "gsm", Name: "GSM 06.10", Kind: KindAudio, Family: FamilySpeech, Lossy: true, DefaultBitrate: 13000, Channels: 1,
			FFmpegNames: []string{"gsm", "gsm_ms"}, Encoders: []string{"gsm"}, Decoders: []string{"gsm", "gsm_ms"}},
		{Key: "ilbc", Name: "iLBC", Kind: KindAudio, Family: FamilySpeech, Lossy: true, DefaultBitrate: 15200, Channels: 1,
			FFmpegNames: []string{"ilbc"}, Decoders: []string{"ilbc"}},
		{Key: "siren", Name: "Siren", Kind: KindAudio, Family: FamilySpeech, Lossy: true, Channels: 1,
			FFmpegNames: []string{"siren"}, Decoders: []string{"siren"}},
		{Key: "qcelp", Name: "QCELP", Kind: KindAudio, Family: FamilySpeech, Lossy: true, Channels: 1,
			FFmpegNames: []string{"qdmc", "qcelp"}, Decoders: []string{"qcelp"}},
		{Key: "evrc", Name: "EVRC", Kind: KindAudio, Family: FamilySpeech, Lossy: true, Channels: 1,
			FFmpegNames: []string{"evrc"}, Decoders: []string{"evrc"}},

		// --- Audio: retro game ------------------------------------------------------------
		{Key: "binkaudio", Name: "Bink Audio", Kind: KindAudio, Family: FamilyRetro, Lossy: true, Channels: 2,
			FFmpegNames: []string{"binkaudio_rdft", "binkaudio_dct"}, Decoders: []string{"binkaudio_rdft", "binkaudio_dct"},
			SubFormats: []string{"RDFT", "DCT"}},
		{Key: "cook", Name: "RealAudio Cook", Kind: KindAudio, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"cook"}, Decoders: []string{"cook"}},
		{Key: "atrc", Name: "RealAudio ATRAC", Kind: KindAudio, Family: FamilyRetro, Lossy: true, FFmpegNames: []string{"atrc"}, Decoders: []string{"atrc"}},
		{Key: "sipr", Name: "RealAudio Sipro", Kind: KindAudio, Family: FamilySpeech, Lossy: true, FFmpegNames: []string{"sipr"}, Decoders: []string{"sipr"}},
		{Key: "ra_144", Name: "RealAudio 1.0", Kind: KindAudio, Family: FamilySpeech, Lossy: false, FFmpegNames: []string{"ra_144"}, Decoders: []string{"ra_144"}},
		{Key: "ra_288", Name: "RealAudio 2.0", Kind: KindAudio, Family: FamilySpeech, Lossy: false, FFmpegNames: []string{"ra_288"}, Decoders: []string{"ra_288"}},
		{Key: "ea_audio", Name: "Electronic Arts Audio", Kind: KindAudio, Family: FamilyRetro, Lossy: true,
			FFmpegNames: []string{"ea_scd", "ea_xa", "adpcm_ea", "adpcm_ea_maxis_xa", "adpcm_ea_r1", "adpcm_ea_r2", "adpcm_ea_r3", "adpcm_ea_xas"},
			Decoders:    []string{"ea_scd", "ea_xa", "adpcm_ea", "adpcm_ea_r1", "adpcm_ea_r2", "adpcm_ea_r3"}},
		{Key: "westwood", Name: "Westwood Audio", Kind: KindAudio, Family: FamilyRetro, Lossy: true,
			FFmpegNames: []string{"westwood_snd1", "adpcm_ima_ws"}, Decoders: []string{"westwood_snd1", "adpcm_ima_ws"}},
		{Key: "interplay_dpcm", Name: "Interplay DPCM", Kind: KindAudio, Family: FamilyRetro, Lossy: false,
			FFmpegNames: []string{"interplay_dpcm"}, Decoders: []string{"interplay_dpcm"}},

		// --- Audio: raw PCM ---------------------------------------------------------------
		{Key: "pcm_s", Name: "Linear PCM", Kind: KindAudio, Family: FamilyLossless, Lossy: false,
			FFmpegNames: []string{"pcm_s16le", "pcm_s16be", "pcm_s24le", "pcm_s24be", "pcm_s32le", "pcm_s32be", "pcm_u8"},
			Encoders:    []string{"pcm_s16le"}, Decoders: []string{"pcm_s16le"},
			SubFormats: []string{"s16le", "s16be", "s24le", "s24be", "s32le", "s32be", "u8"}},
		{Key: "pcm_f", Name: "Floating Point PCM", Kind: KindAudio, Family: FamilyLossless, Lossy: false,
			FFmpegNames: []string{"pcm_f32le", "pcm_f32be", "pcm_f64le", "pcm_f64be"},
			Encoders:    []string{"pcm_f32le"}, Decoders: []string{"pcm_f32le"},
			SubFormats: []string{"f32le", "f32be", "f64le", "f64be"}},
		{Key: "adpcm", Name: "ADPCM", Kind: KindAudio, Family: FamilyLossless, Lossy: true,
			FFmpegNames: []string{"adpcm_ima_qt", "adpcm_ima_wav", "adpcm_ms", "adpcm_yamaha", "adpcm_ima_4xm", "adpcm_ct", "adpcm_ima_ws", "adpcm_ea", "adpcm_g726"},
			Encoders:    []string{"adpcm_ima_wav", "adpcm_ms"},
			Decoders:    []string{"adpcm_ima_qt", "adpcm_ms", "adpcm_ima_ws"},
			SubFormats:  []string{"IMA", "MS", "Yamaha", "4XM", "Creative", "Westwood", "EA", "G.726 ADPCM"}},
	}
}

func pixelFormats() []PixelFormat {
	return []PixelFormat{
		{Name: "yuv420p", BitDepth: 8, Components: "yuv"},
		{Name: "yuv422p", BitDepth: 8, Components: "yuv"},
		{Name: "yuv444p", BitDepth: 8, Components: "yuv"},
		{Name: "yuvj420p", BitDepth: 8, Components: "yuv"},
		{Name: "yuvj422p", BitDepth: 8, Components: "yuv"},
		{Name: "yuvj444p", BitDepth: 8, Components: "yuv"},
		{Name: "yuv420p10le", BitDepth: 10, Components: "yuv"},
		{Name: "yuv422p10le", BitDepth: 10, Components: "yuv"},
		{Name: "yuv444p10le", BitDepth: 10, Components: "yuv"},
		{Name: "yuv420p12le", BitDepth: 12, Components: "yuv"},
		{Name: "rgb24", BitDepth: 8, Components: "rgb"},
		{Name: "bgr24", BitDepth: 8, Components: "rgb"},
		{Name: "rgba", BitDepth: 8, Components: "rgb", Alpha: true},
		{Name: "bgra", BitDepth: 8, Components: "rgb", Alpha: true},
		{Name: "argb", BitDepth: 8, Components: "rgb", Alpha: true},
		{Name: "abgr", BitDepth: 8, Components: "rgb", Alpha: true},
		{Name: "gbrp", BitDepth: 8, Components: "rgb"},
		{Name: "yuva420p", BitDepth: 8, Components: "yuv", Alpha: true},
		{Name: "yuva444p", BitDepth: 8, Components: "yuv", Alpha: true},
		{Name: "gray", BitDepth: 8, Components: "gray"},
		{Name: "gray16le", BitDepth: 16, Components: "gray"},
		{Name: "monow", BitDepth: 1, Components: "gray"},
		{Name: "monob", BitDepth: 1, Components: "gray"},
		{Name: "pal8", BitDepth: 8, Components: "palette", Alpha: true},
	}
}

// ---------------------------------------------------------------------------
// Index
// ---------------------------------------------------------------------------

// Registry answers taxonomy questions. It is safe for concurrent use.
type Registry struct {
	containers []Container
	codecs     []Codec
	pixels     []PixelFormat

	byExt      map[string]*Container
	byFFmpeg   map[string]*Container
	byKey      map[string]*Container
	codecByKey map[string]*Codec
	codecByFF  map[string]*Codec
}

// New builds the taxonomy index once at startup.
func New() *Registry {
	r := &Registry{
		byExt:      map[string]*Container{},
		byFFmpeg:   map[string]*Container{},
		byKey:      map[string]*Container{},
		codecByKey: map[string]*Codec{},
		codecByFF:  map[string]*Codec{},
	}
	r.containers = containers()
	r.codecs = codecs()
	r.pixels = pixelFormats()

	for i := range r.containers {
		c := &r.containers[i]
		r.byKey[c.Key] = c
		for _, e := range c.Extensions {
			if _, dup := r.byExt[e]; !dup {
				r.byExt[e] = c
			}
		}
		for _, f := range c.FFmpegNames {
			if _, dup := r.byFFmpeg[f]; !dup {
				r.byFFmpeg[f] = c
			}
		}
	}
	for i := range r.codecs {
		k := &r.codecs[i]
		r.codecByKey[k.Key] = k
		for _, f := range k.FFmpegNames {
			if _, dup := r.codecByFF[f]; !dup {
				r.codecByFF[f] = k
			}
		}
	}
	return r
}

// Containers lists every registered muxer.
func (r *Registry) Containers() []Container { return append([]Container(nil), r.containers...) }

// Codecs lists every registered codec.
func (r *Registry) Codecs() []Codec { return append([]Codec(nil), r.codecs...) }

// PixelFormats lists the negotiated sample layouts.
func (r *Registry) PixelFormats() []PixelFormat { return append([]PixelFormat(nil), r.pixels...) }

// NormalizeExt lowercases and guarantees a leading dot.
func NormalizeExt(name string) string {
	e := strings.ToLower(filepath.Ext(name))
	if e != "" && !strings.HasPrefix(e, ".") {
		e = "." + e
	}
	return e
}

// ContainerForExtension resolves a file name or bare extension.
func (r *Registry) ContainerForExtension(name string) (*Container, bool) {
	e := strings.ToLower(name)
	if !strings.HasPrefix(e, ".") {
		e = NormalizeExt(e)
	}
	if e == "" {
		return nil, false
	}
	c, ok := r.byExt[e]
	return c, ok
}

// ContainerForFFmpeg maps a comma separated ffprobe format_name list.
func (r *Registry) ContainerForFFmpeg(names ...string) (*Container, bool) {
	for _, list := range names {
		for _, part := range strings.Split(list, ",") {
			part = strings.TrimSpace(part)
			if part == "" {
				continue
			}
			if c, ok := r.byFFmpeg[part]; ok {
				return c, true
			}
		}
	}
	return nil, false
}

// CodecForFFmpeg maps an ffprobe codec_name to a registry entry.
func (r *Registry) CodecForFFmpeg(name string) (*Codec, bool) {
	c, ok := r.codecByFF[strings.ToLower(strings.TrimSpace(name))]
	return c, ok
}

// CodecByKey resolves a registry key such as "h264" or "pcm_s".
func (r *Registry) CodecByKey(key string) (*Codec, bool) {
	c, ok := r.codecByKey[strings.ToLower(key)]
	return c, ok
}

// ContainerByKey resolves a registry key such as "webm".
func (r *Registry) ContainerByKey(key string) (*Container, bool) {
	c, ok := r.byKey[strings.ToLower(key)]
	return c, ok
}

// PickEncoder returns the first encoder for codecKey that exists in the
// available set, falling back to the codec id itself so the caller still gets a
// concrete argument instead of a crash.
func (r *Registry) PickEncoder(codecKey string, available map[string]bool) string {
	c, ok := r.CodecByKey(codecKey)
	if !ok {
		return codecKey
	}
	for _, e := range c.Encoders {
		if available[e] {
			return e
		}
	}
	if len(c.Encoders) > 0 {
		return c.Encoders[0]
	}
	return codecKey
}

// LegalVideoCodec reports whether codecKey may be muxed into containerKey.
// An empty allowlist means the container is unrestricted.
func (r *Registry) LegalVideoCodec(containerKey, codecKey string) bool {
	c, ok := r.ContainerByKey(containerKey)
	if !ok || len(c.VideoCodecs) == 0 {
		return true
	}
	return containsFold(c.VideoCodecs, codecKey)
}

// LegalAudioCodec reports whether codecKey may be muxed into containerKey.
func (r *Registry) LegalAudioCodec(containerKey, codecKey string) bool {
	c, ok := r.ContainerByKey(containerKey)
	if !ok || len(c.AudioCodecs) == 0 {
		return true
	}
	return containsFold(c.AudioCodecs, codecKey)
}

// DefaultVideoCodec picks a sensible video codec for a target container.
func (r *Registry) DefaultVideoCodec(containerKey string) string {
	c, ok := r.ContainerByKey(containerKey)
	if !ok || len(c.VideoCodecs) == 0 {
		return "libx264"
	}
	return c.VideoCodecs[0]
}

// DefaultAudioCodec picks a sensible audio codec for a target container.
func (r *Registry) DefaultAudioCodec(containerKey string) string {
	c, ok := r.ContainerByKey(containerKey)
	if !ok || len(c.AudioCodecs) == 0 {
		return "aac"
	}
	return c.AudioCodecs[0]
}

// SupportsAlpha reports whether the container can carry transparency.
func (r *Registry) SupportsAlpha(containerKey string) bool {
	c, ok := r.ContainerByKey(containerKey)
	return ok && c.SupportsAlpha
}

// TargetsForKind lists container keys valid for a media kind, sorted by name.
func (r *Registry) TargetsForKind(kind Kind) []string {
	out := make([]string, 0, 32)
	for _, c := range r.containers {
		if c.Kind == kind || c.Kind == KindUnknown {
			out = append(out, c.Key)
		}
	}
	sort.Strings(out)
	return out
}

// Counts reports the size of the taxonomy, used by /api/health.
func (r *Registry) Counts() map[string]int {
	return map[string]int{
		"containers":    len(r.containers),
		"codecs":        len(r.codecs),
		"pixel_formats": len(r.pixels),
		"extensions":    len(r.byExt),
	}
}

func containsFold(list []string, want string) bool {
	for _, s := range list {
		if strings.EqualFold(s, want) {
			return true
		}
	}
	return false
}
