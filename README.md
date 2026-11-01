# Order Management API

A REST API for managing coffee shop orders, developed using Node.js native HTTP module.

## 1. How to Run

### Requirements

* Node.js

### Execution

Clone the repository and navigate to the project directory.

Run the server:

```bash
node server.js
```

The server will be available at:

```text
http://localhost:3000
```

## 2. API Routes

### GET /orders

Returns all orders.

**Request:**

```http
GET http://localhost:3000/orders
```

**Response — 200 OK:**

```json
[
    {
        "id": 1,
        "client": "Nolan",
        "item": "Cappuccino",
        "status": "pendente"
    },
    {
        "id": 2,
        "client": "Juniper",
        "item": "Espresso",
        "status": "pronto"
    },
    {
        "id": 3,
        "client": "Axel",
        "item": "Latte",
        "status": "cancelado"
    }
]
```

### GET /orders?status=pendente

Returns orders filtered by status.

**Request:**

```http
GET http://localhost:3000/orders?status=pendente
```

**Response — 200 OK:**

```json
[
    {
        "id": 1,
        "client": "Nolan",
        "item": "Cappuccino",
        "status": "pendente"
    }
]
```

### GET /orders/:id

Returns an order by its ID.

**Request:**

```http
GET http://localhost:3000/orders/1
```

**Response — 200 OK:**

```json
{
    "id": 1,
    "client": "Nolan",
    "item": "Cappuccino",
    "status": "pendente"
}
```

### POST /orders

Creates a new order.

**Request:**

```http
POST http://localhost:3000/orders
```

**Body:**

```json
{
    "client": "Richard",
    "item": "Mocha"
}
```

**Response — 201 Created:**

```json
{
    "id": 4,
    "client": "Richard",
    "item": "Mocha",
    "status": "pendente"
}
```

### PATCH /orders/:id/status

Updates the status of an existing order.

**Request:**

```http
PATCH http://localhost:3000/orders/1/status
```

**Body:**

```json
{
    "status": "pronto"
}
```

**Response — 200 OK:**

```json
{
    "id": 1,
    "client": "Nolan",
    "item": "Cappuccino",
    "status": "pronto"
}
```

### DELETE /orders/:id

Deletes an existing order.

**Request:**

```http
DELETE http://localhost:3000/orders/1
```

**Response — 204 No Content:**


