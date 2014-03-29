name := "viscount"

version := "1.0-SNAPSHOT"

resolvers += "gphat" at "https://raw.github.com/gphat/mvn-repo/master/releases/"

libraryDependencies ++= Seq(
  cache,
  "wabisabi" %% "wabisabi" % "2.0.8"
)

play.Project.playScalaSettings
