// MIT License
//
// Copyright (c) 2021 Iván Szkiba
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

package dashboard

import (
	"embed"
	"io/fs"

	"github.com/szkiba/xk6-dashboard/internal"
	"go.k6.io/k6/output"
)

const distDir = "assets/ui/dist"

//go:embed assets/ui/dist
var distFS embed.FS

// Register the extensions on module initialization.
func init() {
	output.RegisterExtension("dashboard", New)
}

func New(params output.Params) (output.Output, error) { //nolint:ireturn
	uiFS, err := fs.Sub(distFS, distDir)
	if err != nil {
		return nil, err
	}

	return internal.NewDashboard(params, uiFS)
}
