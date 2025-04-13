package database

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormLogger "gorm.io/gorm/logger"
)

var DB *gorm.DB

func DbSetup() {
	if err := godotenv.Load("packages/database/.env"); err != nil {
		fmt.Println("No .env loaded (running in production?)")
	}

	logger, _ := zap.NewProduction()
	defer logger.Sync()

	zapGormLogger := NewZapGormLogger(logger, gormLogger.Info)

	conn, err := gorm.Open(postgres.Open(getDsn()), &gorm.Config{
		Logger: zapGormLogger,
	})
	if err != nil {
		logger.Fatal("failed to connect to database", zap.Error(err))
	}

	DB = conn

	if err != nil {
		logger.Fatal("migration failed", zap.Error(err))
	}

	logger.Info("migration completed successfully")
}

func getDsn() string {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=%s",
		os.Getenv("HOST"),
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("DATABASE"),
		os.Getenv("SSLMODE"),
	)
	return dsn
}

type ZapGormLogger struct {
	zapLogger *zap.Logger
	level     gormLogger.LogLevel
}

func NewZapGormLogger(z *zap.Logger, lvl gormLogger.LogLevel) gormLogger.Interface {
	return &ZapGormLogger{
		zapLogger: z,
		level:     lvl,
	}
}

func (l *ZapGormLogger) LogMode(level gormLogger.LogLevel) gormLogger.Interface {
	newLogger := *l
	newLogger.level = level
	return &newLogger
}

func (l *ZapGormLogger) Info(ctx context.Context, msg string, data ...interface{}) {
	if l.level >= gormLogger.Info {
		l.zapLogger.Sugar().Infof(msg, data...)
	}
}

func (l *ZapGormLogger) Warn(ctx context.Context, msg string, data ...interface{}) {
	if l.level >= gormLogger.Warn {
		l.zapLogger.Sugar().Warnf(msg, data...)
	}
}

func (l *ZapGormLogger) Error(ctx context.Context, msg string, data ...interface{}) {
	if l.level >= gormLogger.Error {
		l.zapLogger.Sugar().Errorf(msg, data...)
	}
}

func (l *ZapGormLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
	if l.level <= gormLogger.Silent {
		return
	}

	elapsed := time.Since(begin)
	sql, rows := fc()

	if err != nil && l.level >= gormLogger.Error {
		l.zapLogger.Error("GORM Error", zap.Error(err), zap.String("sql", sql), zap.Duration("elapsed", elapsed), zap.Int64("rows", rows))
	} else if l.level >= gormLogger.Info {
		l.zapLogger.Info("GORM SQL", zap.String("sql", sql), zap.Duration("elapsed", elapsed), zap.Int64("rows", rows))
	}
}
