from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from backend.routes import blueprints
import os
import dotenv
from backend.models import db

dotenv.load_dotenv()
CONNECTION_STRING = os.getenv('CONNECTION_STRING')


def create_app():
    app = Flask(__name__, template_folder="../frontend/")
    CORS(app)

    app.config["SQLALCHEMY_DATABASE_URI"] = CONNECTION_STRING
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    
    # Register all blueprints
    for blueprint in blueprints:
        app.register_blueprint(blueprint)

    #telling flask what templates to render at these routes
    @app.route("/")
    def index():
        return render_template("index.html")
    
    @app.route("/admin")
    def admin():
        return render_template("admin.html")
    
    @app.route("/view-credentials")
    def view_credentials():
        return render_template("view-credentials.html")

    @app.route("/register-issuer")
    def register_issuer():
        return render_template("register-issuer.html")
    
    @app.route("/admin-multi_sig")
    def admine_multi():
        return render_template("admin-multi.html")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)