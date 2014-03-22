package models

case class Timeframe(
  id: String,
  name: String
)

case class TimeUnit(
  id: String,
  name: String
)

object TimeframeModel {

  def getAll: List[Timeframe] = {
    return List(
      Timeframe(
        id = "relative",
        name = "chart.timeframe.relative"
      ),
      Timeframe(
        id = "absolute",
        name = "chart.timeframe.absolute"
      )
    )
  }

  def getAllUnits: List[TimeUnit] = {
    return List(
      TimeUnit(
        id = "milliseconds",
        name = "chart.series.time.unit.millisecond"
      ),
      TimeUnit(
        id = "seconds",
        name = "chart.series.time.unit.second"
      ),
      TimeUnit(
        id = "minutes",
        name = "chart.series.time.unit.minute"
      ),
      TimeUnit(
        id = "hours",
        name = "chart.series.time.unit.hour"
      ),
      TimeUnit(
        id = "days",
        name = "chart.series.time.unit.day"
      ),
      TimeUnit(
        id = "weeks",
        name = "chart.series.time.unit.week"
      ),
      TimeUnit(
        id = "months",
        name = "chart.series.time.unit.month"
      ),
      TimeUnit(
        id = "years",
        name = "chart.series.time.unit.year"
      )
    )
  }
}
