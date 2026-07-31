"""
SeriesFlix - Servidor simples para arquivos estáticos
O site acessa a API do TMDb diretamente do navegador
"""

from flask import Flask, send_from_directory
import os

app = Flask(__name__)
STATIC = os.path.join(os.path.dirname(__file__), 'static')


@app.route('/')
def index():
    return send_from_directory(STATIC, 'index.html')


@app.route('/<path:filename>')
def serve(filename):
    return send_from_directory(STATIC, filename)


if __name__ == '__main__':
    print("\n  SeriesFlix - Servidor rodando!")
    print("  Acesse: http://localhost:5050")
    print("  Pressione Ctrl+C para encerrar\n")
    app.run(debug=True, host='0.0.0.0', port=5050)
