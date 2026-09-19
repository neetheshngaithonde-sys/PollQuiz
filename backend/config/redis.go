package config

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

func ConnectRedis(cfg *Config) (*redis.Client, error) {
	var opts *redis.Options

	if cfg.RedisURL != "" {
		parsedOpts, err := redis.ParseURL(cfg.RedisURL)
		if err != nil {
			log.Printf("Warning: Failed to parse REDIS_URL (%v), falling back to REDIS_ADDR", err)
		} else {
			opts = parsedOpts
		}
	}

	if opts == nil {
		opts = &redis.Options{
			Addr:     cfg.RedisAddr,
			Password: cfg.RedisPassword,
			DB:       0,
		}
	}

	client := redis.NewClient(opts)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, err
	}

	log.Printf("Connected to Redis successfully (Addr: %s)", opts.Addr)
	return client, nil
}
