variable "DATABASE_URL" {
  type    = string
  default = file("./database/.db")
}

data "external_schema" "gorm" {
  program = ["go", "run", "./cmd/migrate.go"]
}

env "gorm" {
  src = data.external_schema.gorm.url
  dev = "docker://postgres/15/dev"

  migration {
    dir = "file://database/migrations"
  }

  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}

env "local" {
  url = var.DATABASE_URL

  migration {
    dir = "file://./database/migrations"
  }

  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}

env "production" {
  url = getenv("DATABASE_URL")

  migration {
    dir = "file://database/migrations"
  }

  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}
