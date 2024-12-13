export function multiplyMatrices3x3(A, B) {
    const result = Array.from({ length: 3 }, () => Array(3).fill(0));
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            for (let k = 0; k < 3; k++) {
                result[row][col] += A[row][k] * B[k][col];
            }
        }
    }
    return result;
}

export function multiplyMatrixVector3(matrix, vector) {
    const result = Array(3).fill(0);
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            result[row] += matrix[row][col] * vector[col];
        }
    }
    return result;
}

export function roundDownToTwoDecimals(num) {
    return Math.trunc(num * 100) / 100;
}

export function vectorToStr(vector) {
    const x = roundDownToTwoDecimals(vector[0]);
    const y = roundDownToTwoDecimals(-vector[1]);
    return `${x} / ${y}`;
}