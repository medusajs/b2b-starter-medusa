from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def read_distributors():
    return {"message": "Distributors endpoint - Coming soon"}