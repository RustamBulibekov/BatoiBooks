const URL = "http://localhost:3000/";

export async function fetchUsers() {
    const res = await fetch(`${BASE_URL}/users`)
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return res.json()
}


export async function fetchBooks(){
    const res = await fetch(URL+"books");
    if(!res.ok) throw new Error('Error ' + res.status);
    return res.json();
} 

export async function fetchModels(){
    const res = await fetch(URL + "modules")
    if(!res.ok) throw new Error("Error " + res.status);
    return res.json();
}


export async function createUser(user){
    const res = await fetch(URL +"users", 
        {
            method: 'POST',
            body: JSON.stringify(user),
            headers: {
                "Content-Type": 'aplication/json'
            }
        })
        if(!res.ok){
            throw new Error(res.status + " de la servedor " + res.statusText)
        }
        return res.json();

}

export async function deleteUser(userId){
    const res = await fetch(URL+"users/"+userId,
        method: 
   


    )
}
