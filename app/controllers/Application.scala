package controllers

import models.Search
import play.api._
import play.api.mvc._
import play.api.libs.ws.WS
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object Application extends Controller {

  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  def chart = Action {
    Ok(views.html.chart())
  }

  def specificChart(id: String, row: Int, col: Int) = Action.async {
    Search.getDashboard(id).map({
      res => Ok(views.html.chart(Some(id), Some(res), Some(row), Some(col)))
    })
  }

  def dashboard(id: String) = Action.async {
    Search.getDashboard(id).map({
      res => Ok(views.html.dashboard(id, res))
    });
  }

  def data = Action.async { request =>
    request.body.asJson map { q =>
      WS.url("http://localhost:8080/api/v1/datapoints/query")
        .withHeaders("Content-Type" -> "application/json")
        .post(q.toString) map { response =>
          Ok(response.json.toString)
        }
    } getOrElse {
      Future(BadRequest("Expecting Json data"))
    }
  }

  def metrics = Action.async {
    WS.url("http://localhost:8080/api/v1/metricnames").get map {
      response => Ok(response.json.toString)
    }
  }

  def tags = Action.async {
    WS.url("http://localhost:8080/api/v1/tagnames").get map {
      response => Ok(response.json.toString)
    }
  }
}
