import logging
from logging.config import dictConfig

import sentry_sdk
from fastapi import FastAPI
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware

from app.api.main import api_router
from app.core.config import settings
from app.core.db import init_db


# ---- Logging setup (add this block) ----
LOG_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "default",
        },
    },
    "loggers": {
        # Root logger: everything else will propagate here
        "": {
            "handlers": ["console"],
            "level": "INFO",
        },
        # Optionally, you can define a more specific one for your app
        "app": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

dictConfig(LOG_CONFIG)
logger = logging.getLogger("app.main")
# ----------------------------------------


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)
    logger.info("Sentry initialized", extra={"env": settings.ENVIRONMENT})


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)


if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    logger.info("CORS middleware configured", extra={"origins": settings.all_cors_origins})


@app.on_event("startup")
def on_startup():
    """
    Initialize chat history tables on startup.
    """
    logger.info("App startup: initializing DB")
    init_db()
    logger.info("App startup: DB initialized successfully")


app.include_router(api_router, prefix=settings.API_V1_STR)
logger.info("API router included", extra={"prefix": settings.API_V1_STR})