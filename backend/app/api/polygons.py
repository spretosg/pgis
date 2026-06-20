from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from geoalchemy2.functions import ST_AsGeoJSON
from sqlalchemy import func

from app.db.dependencies import get_db
from app.models.polygon import Polygon
from app.schemas.polygon import PolygonCreate


router = APIRouter(
    prefix="/polygons",
    tags=["polygons"]
)


@router.post("/")
def create_polygon(
    polygon: PolygonCreate,
    db: Session = Depends(get_db)
):

    geojson = str(polygon.geometry).replace("'", '"')

    result = db.execute(
        func.ST_GeomFromGeoJSON(geojson).select()
    )

    geom = result.scalar()

    new_polygon = Polygon(
        name=polygon.name,
        geom=geom
    )

    db.add(new_polygon)
    db.commit()

    return {
        "status": "saved"
    }


@router.get("/")
def list_polygons(
    db: Session = Depends(get_db)
):

    polygons = db.query(Polygon).all()

    output = []

    for p in polygons:

        geojson = db.scalar(
            ST_AsGeoJSON(p.geom)
        )

        output.append({
            "id": p.id,
            "name": p.name,
            "geometry": geojson
        })

    return output
