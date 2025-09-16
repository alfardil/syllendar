set shell := ["bash", "-uc"]

# Run the dev server (backend & frontend)
dev *args:
    pnpm i -g concurrently && concurrently "just frontend-dev" "just backend-dev" {{args}}

frontend-dev *args:
    cd frontend && pnpm i && pnpm run dev {{args}}

backend-dev *args:
    cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload {{args}}
