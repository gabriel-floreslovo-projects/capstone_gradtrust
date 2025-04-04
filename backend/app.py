from flask import Flask, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from backend.routes import blueprints
from flask_jwt_extended import JWTManager
import os
import dotenv
from backend.models import db
from backend.config import JWT_SECRET_KEY, SECRET_KEY

dotenv.load_dotenv()
CONNECTION_STRING = os.getenv('CONNECTION_STRING')
FRONTEND_ORIGIN = os.getenv('FRONTEND_ORIGIN')

def create_app():
    app = Flask(__name__, template_folder="../frontend/")
    CORS(app, supports_credentials=True, origins=[FRONTEND_ORIGIN], methods=['GET','POST','DELETE','OPTIONS'],
        allow_headers=['Content-Type', 'Authorization'])
    JWTManager(app)

    app.config["SQLALCHEMY_DATABASE_URI"] = CONNECTION_STRING
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    # Not sure why I had to enable jwt stuff with app.config (I thought that was what config file was for), but here we are
    app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
    app.config["SECRET_KEY"] = SECRET_KEY
    app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
    app.config["JWT_ACCESS_COOKIE_NAME"] = "access_token"

    db.init_app(app)
    
    # Register all blueprints
    for blueprint in blueprints:
        app.register_blueprint(blueprint)

    @app.route("/")
    def hello():
        return jsonify({"msg": "backend is running"}), 200
    
    '''
    FRONTEND IS SERVING THE PAGES, 
    SO WE ARE NOT USING FLASK'S RENDER_TEMPLATE
    FOR THESE ROUTES ANYMORE
    '''

    # @app.route("/admin")
    # def admin():
    #     return render_template("admin.html")
    
    # @app.route("/view-credentials")
    # def view_credentials():
    #     return render_template("view-credentials.html")

    # @app.route("/register-issuer")
    # def register_issuer():
    #     return render_template("register-issuer.html")
    
    # @app.route("/admin-multi_sig")
    # def admine_multi():
    #     return render_template("admin-multi.html")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)