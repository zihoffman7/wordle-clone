from flask import Flask, redirect, url_for, render_template, request, session, jsonify
from random import choice
from nltk import download, chain
from nltk.corpus import wordnet

download("wordnet")
download("omw-1.4")

app = Flask(__name__)
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
app.secret_key = "tan the man"

words = [wrd for wrd in set(chain(*[ss.lemma_names() for ss in wordnet.all_synsets("n")])) if len(wrd) == 5]

def gen_word():
    word = choice(words)
    if word != word.lower():
        return gen_word()
    return word

@app.route("/", methods=["GET"])
def index():
    session["guessed"] = []
    session["guesses"] = {"pos": [], "cor": [], "inc": []}
    session["word"] = gen_word()
    return render_template("index.html")

@app.route("/req", methods=["POST"])
def update():
    if not wordnet.synsets(request.form["guess"]):
        return jsonify(bad=True)
    for c,i in enumerate(request.form["guess"]):
        if i in session["word"]:
            if i not in session["guesses"]["cor"]:
                session["guesses"]["cor"].append([c, i])
            if i == session["word"][c]:
                session["guesses"]["cor"].remove([c, i])
                if i not in session["guesses"]["pos"]:
                    session["guesses"]["pos"].append([c, i])
        else:
            session["guesses"]["inc"].append([c, i])

    if int(request.form["num"]) >= 5 or len(session["guesses"]["pos"]) == 5:
        syns = wordnet.synsets(session["word"])
        return jsonify(data=session["guesses"], word=session["word"], definition=syns[0].definition())
    return jsonify(data=session["guesses"])


if __name__ = "__run__":
    app.run(port=2000, host="0.0.0.0")
