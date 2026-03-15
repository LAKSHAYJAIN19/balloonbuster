export function getScoreMessage(score){

    if(score <= 50){
        return 'Seriously ? Do I need to add "How to Play" section for you ?'
    }

    if(score <= 100){
        return "Even a 5 year old can get this score and you probably still took more time than him"
    }

    if(score <= 150){
        return "C'mon that's not your level , push it."
    }

    if(score <= 200){
        return "Finally some improvement to reach an average score"
    }

    if(score <= 250){
        return 'Good, Welcome to "Above average Group"'
    }

    if(score <= 300){
        return "Wanna be the Leader of the Elite Group ?"
    }

    return "It was Perfect, Perfect , Everything down to the last minute details"
}