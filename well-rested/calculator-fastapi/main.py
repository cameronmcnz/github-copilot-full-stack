from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Basic Calculator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3004"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/sum", response_model=float)
def get_sum(augend: float = Query(...), addend: float = Query(...)) -> float:
    print(f"[calculator-fastapi] /sum called with augend={augend}, addend={addend}")
    return augend + addend


@app.get("/difference", response_model=float)
def get_difference(minuend: float = Query(...), subtrahend: float = Query(...)) -> float:
    print(
        f"[calculator-fastapi] /difference called with minuend={minuend}, subtrahend={subtrahend}"
    )
    return minuend - subtrahend


@app.get("/product", response_model=float)
def get_product(multiplicand: float = Query(...), multiplier: float = Query(...)) -> float:
    print(
        f"[calculator-fastapi] /product called with multiplicand={multiplicand}, multiplier={multiplier}"
    )
    return multiplicand * multiplier


@app.get("/quotient", response_model=float)
def get_quotient(dividend: float = Query(...), divisor: float = Query(...)) -> float:
    print(f"[calculator-fastapi] /quotient called with dividend={dividend}, divisor={divisor}")
    if divisor == 0:
        raise HTTPException(
            status_code=422,
            detail={"code": "invalid_calculation", "message": "Divisor must not be zero."},
        )
    return dividend / divisor


@app.get("/remainder", response_model=float)
def get_remainder(dividend: float = Query(...), divisor: float = Query(...)) -> float:
    print(f"[calculator-fastapi] /remainder called with dividend={dividend}, divisor={divisor}")
    if divisor == 0:
        raise HTTPException(
            status_code=422,
            detail={"code": "invalid_calculation", "message": "Divisor must not be zero."},
        )
    return dividend % divisor
