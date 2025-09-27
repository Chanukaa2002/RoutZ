export const insertionSort = (arr)=>{
    for(let i=0; i<arr.length;i++){
        let key = arr[i];
        let j;

        for(j=i-1;j>=0&&arr[j]>key;j--){
            arr[j+1] = arr[j]
        }
        arr[j+1] = key
    }
    return arr;
}