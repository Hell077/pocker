param(
    [Parameter(Mandatory=$true)]
    [string]$ModuleName
)

$basePath = "internal/modules/$ModuleName"
$repoPath = "$basePath/repo"
$servicePath = "$basePath/service"
$handlerPath = "$basePath/handler"

# Создание директорий
New-Item -ItemType Directory -Force -Path $basePath, $repoPath, $servicePath, $handlerPath | Out-Null

# workflow.go
@"
package $ModuleName

import (
    "context"
    "go.temporal.io/sdk/workflow"
    "time"
)

func Workflow(ctx workflow.Context, input string) (string, error) {
    ao := workflow.ActivityOptions{
        StartToCloseTimeout: 10 * time.Second,
    }
    ctx = workflow.WithActivityOptions(ctx, ao)

    var result string
    err := workflow.ExecuteActivity(ctx, Activity, input).Get(ctx, &result)
    return result, err
}

func Activity(ctx context.Context, input string) (string, error) {
    return "processed_" + input, nil
}
"@ | Set-Content "$basePath/workflow.go"

# def.go
@"
package $ModuleName

import (
    "go.temporal.io/sdk/worker"
    "go.temporal.io/sdk/workflow"
)

type ${ModuleName}WorkflowDef struct{}

func (${ModuleName}WorkflowDef) Name() string {
    return "$ModuleName"
}

func (${ModuleName}WorkflowDef) Register(w worker.Worker) {
    w.RegisterWorkflowWithOptions(Workflow, workflow.RegisterOptions{Name: "$ModuleName"})
    w.RegisterActivity(Activity)
}
"@ | Set-Content "$basePath/def.go"

# repo.go
@"
package repo

import (
    "context"
    "gorm.io/gorm"
)

type ${ModuleName}Repo struct {
    DB *gorm.DB
}

func New${ModuleName}Repo(db *gorm.DB) *${ModuleName}Repo {
    return &${ModuleName}Repo{DB: db}
}
"@ | Set-Content "$repoPath/repo.go"

# service.go
@"
package service

import (
    "context"
    "go.temporal.io/sdk/client"
)

type ${ModuleName}Service struct {
    Temporal client.Client
}

func New${ModuleName}Service(c client.Client) *${ModuleName}Service {
    return &${ModuleName}Service{Temporal: c}
}

func (s *${ModuleName}Service) Start${ModuleName}Workflow(ctx context.Context, input string) (string, error) {
    options := client.StartWorkflowOptions{
        ID:        "${ModuleName}_workflow_" + input,
        TaskQueue: "default-task-queue",
    }

    we, err := s.Temporal.ExecuteWorkflow(ctx, options, "$ModuleName", input)
    if err != nil {
        return "", err
    }

    var result string
    if err := we.Get(ctx, &result); err != nil {
        return "", err
    }
    return result, nil
}
"@ | Set-Content "$servicePath/service.go"

# handler.go
@"
package handler

import (
    "github.com/gofiber/fiber/v2"
    "your_project/internal/modules/$ModuleName/service"
)

type ${ModuleName}Handler struct {
    Service *service.${ModuleName}Service
}

func New${ModuleName}Handler(s *service.${ModuleName}Service) *${ModuleName}Handler {
    return &${ModuleName}Handler{Service: s}
}

func (h *${ModuleName}Handler) RegisterRoutes(r fiber.Router) {
    r.Post("/start", h.Start)
}

func (h *${ModuleName}Handler) Start(c *fiber.Ctx) error {
    type Request struct {
        Input string `json:"input"`
    }
    var req Request
    if err := c.BodyParser(&req); err != nil {
        return fiber.ErrBadRequest
    }

    result, err := h.Service.Start${ModuleName}Workflow(c.Context(), req.Input)
    if err != nil {
        return fiber.NewError(fiber.StatusInternalServerError, err.Error())
    }

    return c.JSON(fiber.Map{"result": result})
}
"@ | Set-Content "$handlerPath/handler.go"

Write-Host "✅ Module '$ModuleName' created in internal/modules/$ModuleName"
