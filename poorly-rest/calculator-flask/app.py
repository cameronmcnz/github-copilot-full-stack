from flask import Flask, jsonify, request


app = Flask(__name__)


def parse_operands():
    a = request.args.get("a", type=float)
    b = request.args.get("b", type=float)

    if a is None or b is None:
        return None, jsonify({"message": "Query parameters a and b are required and must be valid numbers."}), 400

    return (a, b), None, None


@app.get("/operations/add")
def add():
    operands, error_response, status_code = parse_operands()
    if error_response is not None:
        return error_response, status_code

    a, b = operands
    print(f"[flask] add invoked with a={a}, b={b}")
    return jsonify({"result": a + b})


@app.get("/operations/subtract")
def subtract():
    operands, error_response, status_code = parse_operands()
    if error_response is not None:
        return error_response, status_code

    a, b = operands
    print(f"[flask] subtract invoked with a={a}, b={b}")
    return jsonify({"result": a - b})


@app.get("/operations/multiply")
def multiply():
    operands, error_response, status_code = parse_operands()
    if error_response is not None:
        return error_response, status_code

    a, b = operands
    print(f"[flask] multiply invoked with a={a}, b={b}")
    return jsonify({"result": a * b})


@app.get("/operations/divide")
def divide():
    operands, error_response, status_code = parse_operands()
    if error_response is not None:
        return error_response, status_code

    a, b = operands
    print(f"[flask] divide invoked with a={a}, b={b}")

    if b == 0:
        return jsonify({"message": "Division by zero is not allowed."}), 422

    return jsonify({"result": a / b})


@app.get("/operations/modulus")
def modulus():
    operands, error_response, status_code = parse_operands()
    if error_response is not None:
        return error_response, status_code

    a, b = operands
    print(f"[flask] modulus invoked with a={a}, b={b}")

    if b == 0:
        return jsonify({"message": "Division by zero is not allowed."}), 422

    return jsonify({"result": a % b})


if __name__ == "__main__":
    print("[flask] calculator service listening on http://localhost:5007")
    app.run(host="0.0.0.0", port=5007)