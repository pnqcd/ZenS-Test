function miniMaxSum(arr) {
    let minNum = arr[0];
    let maxNum = arr[0];
    let sum = arr[0];

    for (let i = 1; i < arr.length; i++) {
        sum += arr[i];
        if (arr[i] > maxNum) maxNum = arr[i];
        if (arr[i] < minNum) minNum = arr[i];
    }

    let minSum = sum - maxNum;
    let maxSum = sum - minNum;

    console.log(minSum + " " + maxSum);
}

const arr = [1, 2, 3, 4, 5];
miniMaxSum(arr);