CREATE TABLE "TRACKS" (
	"ID" SERIAL NOT NULL PRIMARY KEY,
	"CODE" TEXT NOT NULL,
	"THUMBNAIL" TEXT
)

CREATE TABLE "GHOSTS" (
	"ID" SERIAL NOT NULL PRIMARY KEY,
	"GHOSTSTRING" TEXT NOT NULL,
	"TRACKID" SERIAL NOT NULL,
	"TIME" INT NOT NULL,
	CONSTRAINT fk_track
      FOREIGN KEY("TRACKID") 
	  REFERENCES "TRACKS"("ID")
)