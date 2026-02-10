import { api } from "@/conf/api";

export async function verificaWhatsapp() {
    let usuario = JSON.parse(localStorage.getItem('usu'));


    let id_empresa = usuario.id_empresa

    console.log('ID EMPRESA:', id_empresa)

    let acesso = await api.get(`/verificaWhatsapp/${id_empresa}`)

    console.log(acesso)
    let acessoTelefonia = acesso.data.dados[0].telefonia;
    console.log('eu sou o acessoTelefonia', acessoTelefonia)
    
        return acessoTelefonia;
    
}
