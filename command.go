package dashboard

import (
	"os"

	"github.com/szkiba/xk6-dashboard/dashboard"
	"github.com/szkiba/xk6-dashboard/ui"
)

func init() {
	if len(os.Args) == 1 || os.Args[1] != "dashboard" {
		return
	}

	dashboard.Execute(ui.GetFS())
}
