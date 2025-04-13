package main

import (
	"ariga.io/atlas-provider-gorm/gormschema"
	"fmt"
	"io"
	"os"
	"poker/packages/database"
	"strings"
)

func main() {
	sb := &strings.Builder{}
	loadModels(sb)

	io.WriteString(os.Stdout, sb.String())
}

func loadModels(sb *strings.Builder) {
	models := []interface{}{
		database.Account{},
		database.AccountBalance{},
	}
	stmts, err := gormschema.New("postgres").Load(models...)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to load gorm schema: %v\n", err)
		os.Exit(1)
	}
	sb.WriteString(stmts)
	sb.WriteString(";\n")
}
