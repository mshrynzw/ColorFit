import logging
from logging.config import dictConfig

from app.core.request_context import get_request_id


class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = get_request_id() or "-"
        return True


def setup_logging(level: str = "INFO") -> None:
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "filters": {
                "request_id": {
                    "()": RequestIdFilter,
                }
            },
            "formatters": {
                "default": {
                    "format": (
                        "%(asctime)s %(levelname)s [%(request_id)s] "
                        "%(name)s: %(message)s"
                    ),
                }
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "filters": ["request_id"],
                    "formatter": "default",
                }
            },
            "root": {
                "level": level.upper(),
                "handlers": ["console"],
            },
            "loggers": {
                "uvicorn.access": {
                    "level": "WARNING",
                    "propagate": False,
                    "handlers": ["console"],
                }
            },
        }
    )
