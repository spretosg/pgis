from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geometry

from app.db.base import Base


class Polygon(Base):

    __tablename__ = "polygons"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    name: Mapped[str] = mapped_column(
        String(255)
    )

    geom = mapped_column(
        Geometry(
            geometry_type="POLYGON",
            srid=4326
        )
    )
