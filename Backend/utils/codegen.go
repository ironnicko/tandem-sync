package utils

import (
	"crypto/sha1"
	"encoding/hex"
	"time"
)

func GenRideCode() string {
	timestamp := time.Now().UTC().UTC().Format(time.RFC3339)
	hash := sha1.Sum([]byte(timestamp))
	return hex.EncodeToString(hash[:])[:8]
}
