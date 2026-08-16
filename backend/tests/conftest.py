from fastapi.testclient import TestClient
from pytest import fixture

from app.main import app


@fixture
def client() -> TestClient:
    return TestClient(app)
