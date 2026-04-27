export class Pintar {
    buildNumberPool(ranges = []) {
        const pool = [];

        ranges.forEach((range) => {
            const [start, end] = String(range).split('-').map((value) => Number(value));
            if (Number.isFinite(start) && Number.isFinite(end)) {
                for (let value = start; value <= end; value += 1) {
                    pool.push(value);
                }
            }
        });

        return pool.length ? pool : [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    getMaxResult(ranges = []) {
        const pool = this.buildNumberPool(ranges);
        const maxValue = Math.max(...pool);
        return Math.max(2, maxValue * 2);
    }

    generateQuestion(ranges = []) {
        const pool = this.buildNumberPool(ranges);
        const maxPool = Math.max(...pool);

        const first = pool[Math.floor(Math.random() * pool.length)];
        const second = pool[Math.floor(Math.random() * pool.length)];
        const useSum = Math.random() >= 0.5;

        if (useSum) {
            return {
                operator: '+',
                left: first,
                right: second,
                answer: first + second,
                expression: `${first} + ${second} = ?`
            };
        }

        let left = Math.max(first, second);
        let right = Math.min(first, second);

        if (left === right) {
            if (left < maxPool) {
                left += 1;
            } else if (right > 1) {
                right -= 1;
            }
        }

        if (left - right < 1) {
            return {
                operator: '+',
                left: first,
                right: second,
                answer: first + second,
                expression: `${first} + ${second} = ?`
            };
        }

        return {
            operator: '-',
            left,
            right,
            answer: left - right,
            expression: `${left} - ${right} = ?`
        };
    }
}
