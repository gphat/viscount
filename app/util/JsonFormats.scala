package util

import models._
import play.api.i18n.Messages
import play.api.libs.json.Json._
import play.api.libs.json._

object JsonFormats {

  implicit object TimeframeFormat extends Format[Timeframe] {
    def reads(json: JsValue): JsResult[Timeframe] = {
      JsSuccess(Timeframe(
        id = (json \ "id").as[String],
        name = (json \ "name").as[String]
      ))
    }

    def writes(obj: Timeframe): JsValue = {
      val simple: Map[String,JsValue] = Map(
        "id"        -> JsString(obj.id),
        "name"      -> JsString(obj.name),
        "nameI18N"  -> JsString(Messages(obj.name))
      )
      toJson(simple)
    }
  }

  implicit object TimeUnitFormat extends Format[TimeUnit] {
    def reads(json: JsValue): JsResult[TimeUnit] = {
      JsSuccess(TimeUnit(
        id = (json \ "id").as[String],
        name = (json \ "name").as[String]
      ))
    }

    def writes(obj: TimeUnit): JsValue = {
      val simple: Map[String,JsValue] = Map(
        "id"        -> JsString(obj.id),
        "name"      -> JsString(obj.name),
        "nameI18N"  -> JsString(Messages(obj.name))
      )
      toJson(simple)
    }
  }
}
