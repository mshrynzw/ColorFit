from fastapi.testclient import TestClient

from app.core.request_context import REQUEST_ID_HEADER


def test_generates_request_id_when_missing(client: TestClient) -> None:
    response = client.get("/health")

    assert response.headers[REQUEST_ID_HEADER]


def test_echoes_client_request_id(client: TestClient) -> None:
    request_id = "550e8400-e29b-41d4-a716-446655440000"
    response = client.get("/health", headers={REQUEST_ID_HEADER: request_id})

    assert response.headers[REQUEST_ID_HEADER] == request_id


def test_head_health_includes_request_id(client: TestClient) -> None:
    response = client.head("/health")

    assert response.status_code == 200
    assert response.headers[REQUEST_ID_HEADER]


def test_method_not_allowed_includes_request_id(client: TestClient) -> None:
    response = client.put("/health")

    assert response.status_code == 405
    assert response.headers[REQUEST_ID_HEADER]
