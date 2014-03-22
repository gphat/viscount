package controllers.api

import models.TimeframeModel
import play.api.libs.json.Json
import play.api.mvc._
import util.JsonFormats._

object Timeframe extends Controller {

  def index = Action {
    Ok(Json.toJson(TimeframeModel.getAll))
  }

  def units = Action {
    Ok(Json.toJson(TimeframeModel.getAllUnits))
  }
}
