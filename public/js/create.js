const createForm = document.getElementById('create-pet-form');

if (createForm){
    const input1 = document.getElementById('design1')
    const input2 = document.getElementById('design2')
    const input3 = document.getElementById('design3')

    const img1 = document.getElementById('img1')
    const img2 = document.getElementById('img2')
    const img3 = document.getElementById('img3')

    img1.onclick = () => {input1.checked = true}
    img2.onclick = () => {input2.checked = true}
    img3.onclick = () => {input3.checked = true}

    const designError = document.getElementById('designError')
    const nameInput = document.getElementById('name')
    const nameError = document.getElementById('nameError')

    function validateName(name, prefix){
        if(!name){throw `Error: ${prefix} name must be provided.`}
        if (typeof name !== 'string'){
            throw `Error: ${prefix} name must be a string`
        }
        name = name.trim().toLowerCase()
        if (name.length === 0){
            throw `Error: ${prefix} name cannot be only whitespace.`
        }
        if (/[^a-z]/.test(name)){
            throw `Error: ${prefix} name may only contain alphabetical characters.`
        }
    
        return name
    }

    createForm.addEventListener('submit', (event) => {
        designError.textContent = '';
        nameError.textContent = '';

        let valid = true;

        try {
            validateName(nameInput.value, 'Pet');
        } catch (e) {
            valid = false;
            nameError.textContent = e;
        }
        
        if(!valid) {
            event.preventDefault();
        }
    })
}
