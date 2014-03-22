package models

import play.api._
import play.api.Play.current
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import wabisabi._

object Search {

  lazy val url = Play.configuration.getString("elasticsearch.url")
  lazy val client = new Client(url.getOrElse("http://localhost:9200"))

  def getDashboard(id: String): Future[String] = {
    client.get(index = "dashboards", `type` = "dashboard", id = id) map { res => res.getResponseBody }
  }

  def getAllDashboards: Future[String] = {
    client.search("dashboards", """{ "query": { "match_all": {} } }""") map { res =>
      res.getResponseBody
    }
  }
}
