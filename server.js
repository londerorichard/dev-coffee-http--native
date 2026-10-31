const PORT = 3000;

// ==========================================================
// CLASSES
// ==========================================================

class OrderStatus {
    static PENDENTE = "pendente";
    static PRONTO = "pronto";
    static CANCELADO = "cancelado";
}

// Prevents modifications in OrderStatus
Object.freeze(OrderStatus);


class Order {

    constructor(id, client, item, status) {
        this.id = id;
        this.client = client;
        this.item = item;
        this.status = status;
    }

    getInformation() {
        return {
            id: this.id,
            client: this.client,
            item: this.item,
            status: this.status
        };
    }
}

function getAllInformations() {
    return orders.map(order => order.getInformation());
}


// Initial data
const orders = [
    new Order(1, "Nolan", "Cappuccino", OrderStatus.PENDENTE),
    new Order(2, "Juniper", "Espresso", OrderStatus.PRONTO),
    new Order(3, "Axel", "Latte", OrderStatus.CANCELADO)
];


// ==========================================================
// VALIDATIONS
// ==========================================================

function validateStatus(status) {
    const validStatuses = Object.values(OrderStatus);

    return validStatuses.includes(status);
}


// POST - Validate a new order
function validateOrder(data) {

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return {
            valid: false,
            message: "Invalid order data"
        };
    }

    if (typeof data.client !== "string" || data.client.trim() === "") {
        return {
            valid: false,
            message: "Client is required"
        };
    }

    if (typeof data.item !== "string" || data.item.trim() === "") {
        return {
            valid: false,
            message: "Item is required"
        };
    }

    if (!validateStatus(data.status)) {
        return {
            valid: false,
            message: "Invalid order status"
        };
    }

    return { valid: true };
}


// PATCH - Validate an existing order update
function validateOrderUpdate(data) {

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return {
            valid: false,
            message: "Invalid update data"
        };
    }

    const allowedFields = ["client", "item", "status"];

    const fields = Object.keys(data);

    if (fields.length === 0) {
        return {
            valid: false,
            message: "At least one field is required"
        };
    }

    const invalidFields = fields.filter(
        field => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
        return {
            valid: false,
            message: `Invalid fields: ${invalidFields.join(", ")}`
        };
    }

    if ("client" in data &&
        (typeof data.client !== "string" || data.client.trim() === "")) {
        return {
            valid: false,
            message: "Invalid client"
        };
    }

    if ("item" in data &&
        (typeof data.item !== "string" || data.item.trim() === "")) {
        return {
            valid: false,
            message: "Invalid item"
        };
    }

    if ("status" in data && !validateStatus(data.status)) {
        return {
            valid: false,
            message: "Invalid order status"
        };
    }

    return { valid: true };
}


// Helper function
function sendResponse(res, statusCode, data) {

    if (statusCode === 204) {
        res.writeHead(204);
        return res.end();
    }

    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify(data));
}


// Router
function handleRequest(req, res) {

    const url = new URL(req.url, "http://localhost");

    const pathname = url.pathname;

    // GET /orders
    if (req.method === "GET" && pathname === "/orders") {

        // Getting all the items data
        const orderList = orders.map(order =>
            order.getInformation()
        );

        // Status code
        return sendResponse(res, 200, orderList);
    }

    // GET /orders/id
    if (req.method === "GET" && pathname.startsWith("/orders/")) {

        const id = Number(pathname.split("/")[2]);

        if (!Number.isInteger(id) || id <= 0) {
            return sendResponse(res, 400, {
                message: "Invalid order ID"
            });
        }

        const order = orders.find(order => order.id === id);

        if (!order) {
            return sendResponse(res, 404, {
                message: "Order not found"
            });
        }

        return sendResponse(res, 200, order.getInformation());
    }

    // Unknown route
    return sendResponse(res, 404, {
        message: "Route not found"
    });
}


// Initializing server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


// ==========================================================
// ENDPOINTS
// ==========================================================

function getOrders(req, res) {

    const url = new URL(req.url, "http://localhost");

    const status = url.searchParams.get("status");

    let orderList = getAllInformations();

    if (status && !validateStatus(status)) {
        return sendResponse(res, 400, {
            message: "Invalid order status"
        });
    }

    if (status) {
        orderList = orderList.filter(order => order.status === status);
    }

    return sendResponse(res, 200, orderList);
}


function getOrderById(req, res) {

    const url = new URL(req.url, "http://localhost");

    const id = Number(url.pathname.split("/")[2]);

    if (!Number.isInteger(id) || id <= 0) {
        return sendResponse(res, 400, {
            message: "Invalid order ID"
        });
    }

    const order = orders.find(order => order.id === id);

    if (!order) {
        return sendResponse(res, 404, {
            message: "Order not found"
        });
    }

    return sendResponse(res, 200, order.getInformation());
}

