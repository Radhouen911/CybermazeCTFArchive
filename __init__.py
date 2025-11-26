from flask import Blueprint, send_from_directory
import os

def load(app):
    """
    This function is called by CTFd when loading the theme.
    We use it to override specific routes with our React app.
    """
    
    # Get the theme directory
    theme_dir = os.path.dirname(os.path.abspath(__file__))
    static_dir = os.path.join(theme_dir, 'static')
    
    # Create a blueprint for our React app
    arcade = Blueprint(
        'arcade',
        __name__,
        static_folder='static',
        static_url_path='/themes/Arcade/static',
        template_folder='templates'
    )
    
    # Serve index.html for user-facing routes (GET only)
    @arcade.route('/', methods=['GET'])
    @arcade.route('/login', methods=['GET'])
    @arcade.route('/register', methods=['GET'])
    @arcade.route('/challenges', methods=['GET'])
    @arcade.route('/scoreboard', methods=['GET'])
    @arcade.route('/teams', methods=['GET'])
    @arcade.route('/teams/<int:team_id>', methods=['GET'])
    @arcade.route('/users', methods=['GET'])
    @arcade.route('/users/<int:user_id>', methods=['GET'])
    @arcade.route('/profile', methods=['GET'])
    @arcade.route('/settings', methods=['GET'])
    def serve_react_app():
        """Serve the React app for user-facing routes (GET requests only)"""
        return send_from_directory(static_dir, 'index.html')
    
    # Register the blueprint BEFORE other routes
    # This ensures our routes take precedence
    app.register_blueprint(arcade)
    
    return arcade
