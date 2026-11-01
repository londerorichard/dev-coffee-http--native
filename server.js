const http = require("node:http");

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

    constructor(id, client, item, status = OrderStatus.PENDENTE) {
        this.id = id;
        this.client = client;
        this.item = item;
        this.status = status;
    }

    getAllOrders() {
        return {
            id: this.id,
            client: this.client,
            item: this.item,
            status: this.status
        };
    }
}

function getAllOrders() {
    return orders.map(order => order.getAllOrders());
}


// Initial data
const orders = [
    new Order(1, "Nolan", "Cappuccino", OrderStatus.PENDENTE),
    new Order(2, "Juniper", "Espresso", OrderStatus.PRONTO),
    new Order(3, "Axel", "Latte", OrderStatus.CANCELADO)
];

// Next available ID
let nextOrderId = Math.max(...orders.map(order => order.id), 0) + 1;


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


// ==========================================================
// ENDPOINTS
// ==========================================================

// GET /orders
function getOrders(req, res) {

    // Parse the request URL
    const url = new URL(req.url, "http://localhost");

    // Extract the status query parameter
    const status = url.searchParams.get("status");

    // Retrieve all orders
    let orderList = getAllOrders();

    // Validate the status if provided
    if (status && !validateStatus(status)) {
        return sendResponse(res, 400, {
            message: "Invalid order status"
        });
    }

    // Filter orders by status if a filter was provided
    if (status) {
        orderList = orderList.filter(order => order.status === status);
    }

    // Return the resulting order list
    return sendResponse(res, 200, orderList);
}


// GET /orders/:id
function getOrderById(req, res) {

    // Parse the request URL
    const url = new URL(req.url, "http://localhost");

    // Extract the ID from the URL path and convert it to a number
    const id = Number(url.pathname.split("/")[2]);

    // Validate the ID
    if (!Number.isInteger(id) || id <= 0) {
        return sendResponse(res, 404, {
            message: "Invalid order ID"
        });
    }

    // Find the order with the requested ID
    const order = orders.find(order => order.id === id);

    // Return 404 if the order doesn't exist
    if (!order) {
        return sendResponse(res, 404, {
            message: "Order not found"
        });
    }

    // Return the requested order
    return sendResponse(res, 200, order.getAllOrders());
}


// POST /orders
function createOrder(req, res) {

    let body = "";

    // Collect request body chunks
    req.on("data", chunk => body += chunk);

    req.on("end", () => {

        // Parse JSON
        let data;

        try {
            data = JSON.parse(body);
        } catch {
            return sendResponse(res, 400, {
                message: "Invalid JSON body"
            });
        }

        // Validate order data
        const validation = validateOrder(data);

        if (!validation.valid) {
            return sendResponse(res, 400, {
                message: validation.message
            });
        }

        // Create and store order
        const order = new Order(
            nextOrderId++, 
            data.client.trim(), 
            data.item.trim()
        );

        orders.push(order);

        return sendResponse(res, 201, order.getAllOrders());
    });

    req.on("error", () => {
        return sendResponse(res, 400, {
            message: "Error receiving request body"
        });
    });
}


//  PATCH /orders/:id/status
function updateOrderStatus(req, res) {

    const url = new URL(req.url, "http://localhost");

    // Extract order ID
    const id = Number(url.pathname.split("/")[2]);

    // Find order
    const order = orders.find(order => order.id === id);

    if (!order) {
        return sendResponse(res, 404, {
            message: "Order not found"
        });
    }

    let body = "";

    // Collect request body
    req.on("data", chunk => body += chunk);

    req.on("end", () => {

        // Parse JSON
        let data;

        try {
            data = JSON.parse(body);
        } catch {
            return sendResponse(res, 400, {
                message: "Invalid JSON body"
            });
        }

        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data) ||
            Object.keys(data).length !== 1 ||
            !validateStatus(data.status)
        ) {
            return sendResponse(res, 400, {
                message: "Invalid order status"
            });
        }

        // Update order status
        order.status = data.status;

        return sendResponse(res, 200, order.getAllOrders());
    });

    req.on("error", () => {
        return sendResponse(res, 400, {
            message: "Error receiving request body"
        });
    });
}


// DELETE /orders/:id
function deleteOrder(req, res) {

    const url = new URL(req.url, "http://localhost");

    // Extract order ID
    const id = Number(url.pathname.split("/")[2]);

    // Find order index
    const orderIndex = orders.findIndex(order => order.id === id);

    // Check if order exists
    if (orderIndex === -1) {
        return sendResponse(res, 404, {
            message: "Order not found"
        });
    }

    // Remove order from array
    orders.splice(orderIndex, 1);

    // Return 204 No Content
    return sendResponse(res, 204);
}


// Router
function handleRequest(req, res) {
    const url = new URL(req.url, "http://localhost");
    const pathname = url.pathname;

    // GET /orders
    if (req.method === "GET" && pathname === "/orders") {
        return getOrders(req, res);
    }

    // POST /orders
    if (req.method === "POST" && pathname === "/orders") {
        return createOrder(req, res);
    }

    // GET /orders/:id
    if (req.method === "GET" && /^\/orders\/\d+$/.test(pathname)) {
        return getOrderById(req, res);
    }

    // PATCH /orders/:id/status
    if (req.method === "PATCH" && /^\/orders\/\d+\/status$/.test(pathname)) {
        return updateOrderStatus(req, res);
    }

    // DELETE /orders/:id
    if (req.method === "DELETE" && /^\/orders\/\d+$/.test(pathname)) {
        return deleteOrder(req, res);
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