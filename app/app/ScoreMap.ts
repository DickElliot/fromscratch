
enum operator {
    multiply,
    addition,
    subtraction,
}

enum scoreOption {
    // score 1
    default,
    // score 0.4
    common,
    // if only match score 0, 
    // else score 1
    single,
    // if doesn't include 'blockKey'
    // score 0, else score 1
    blocked,
    // Unlocks 'blocked' terms if there 
    // are any
    blockKey,
}

interface IEquationPart {
    value: number,
    operation: operator,
}

interface IScoredID {
    id: number,
    score: scoreOption,
}

interface IEquationMap {
    equation: IEquationPart,
    data?: { [key: string]: number },
}

class wordMap {
    private map: { [key: string]: number[] };
    private mapScores: { [key: string]: number };
    // private weightedMap: { [key: IScoredID]: number };
    private equationMaps: IEquationMap[] = [];
    constructor() {
    }

    addValue(value: string) {
        if (this.mapScores[value] === undefined) {
            this.weightedMap[{ word: value, type: scoreOption.default }]
        }
    }

    addValues(words: string[], weight: scoreOption) {
        for (let word of words) {
        }
    }

    getScore(key: string) {
        return this.mapScores[key];
    }

    getScoreFunction(key: string) {
        return 'hash'
    }

    addEquationMap(eq: IEquationPart, data: string[]) {
        let newMap: IEquationMap = {
            equation: eq,
        };
        for (let datum of data) {
            newMap.data[datum] = eq.value;
        }
        this.equationMaps.push(newMap);
    }

    calculateScore(equation: IEquationPart[]) {
        let score = 0;
        let operation = (value: number, op: operator) => {
            switch (op) {
                case (operator.multiply):
                    return value * 1;
                case (operator.subtraction):
                    return value - 1;
                case (operator.addition):
                    return value + 1;
            }
        };
        for (let h of equation) {
            score += operation(h.value, h.operation);
        }
        return score;
    }



}