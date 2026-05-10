"""
Centralised logging configuration for MindEase AI backend.
Import and call setup_logging() once at startup.
"""

import logging
import sys


def setup_logging(level: str = "INFO") -> None:
    """Configure root logger with a consistent format."""
    logging.basicConfig(
        stream=sys.stdout,
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
