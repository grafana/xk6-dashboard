package ui

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetFS(t *testing.T) {
	t.Parallel()

	fs := GetFS()

	assert.NotNil(t, fs)

	file, err := fs.Open("index.html")

	assert.NoError(t, err)
	assert.NotNil(t, file)

	assert.NoError(t, file.Close())
}
