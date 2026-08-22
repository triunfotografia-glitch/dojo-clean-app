import { COLORS } from "@/components/Colors";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";


interface Graduacao {

  id:string;

  faixa:string;

  data:string;

  professor:string;

  observacao:string;

}



interface Props {

  historico:Graduacao[];

  onAdicionar:()=>void;

}




export default function HistoricoGraduacao({

historico,

onAdicionar,

}:Props){



return(

<View style={styles.container}>


<Text style={styles.title}>
  Histórico de Graduação
</Text>



<Pressable

style={styles.button}

onPress={onAdicionar}

>

<Text style={styles.buttonText}>
+ Nova graduação
</Text>

</Pressable>





{
historico.length === 0 ?

(

<Text style={styles.empty}>
Nenhuma graduação registrada
</Text>

)

:

(

<FlatList

data={historico}

keyExtractor={(item)=>item.id}


renderItem={({item})=>(


<View style={styles.card}>


<Text style={styles.faixa}>
🥋 {item.faixa}
</Text>



<Text style={styles.info}>
Data: {item.data}
</Text>


<Text style={styles.info}>
Professor: {item.professor}
</Text>


{
item.observacao &&

<Text style={styles.info}>
Obs: {item.observacao}
</Text>

}



</View>


)}


/>

)

}



</View>

);


}




const styles = StyleSheet.create({


container:{


marginTop:20,

},



title:{


color:COLORS.primary,

fontSize:20,

fontWeight:"bold",

marginBottom:15,


},



button:{


backgroundColor:COLORS.primary,

padding:15,

borderRadius:15,

alignItems:"center",

marginBottom:15,


},



buttonText:{


color:COLORS.white,

fontWeight:"bold",


},



card:{


backgroundColor:COLORS.card,

borderRadius:15,

padding:15,

marginBottom:10,


},



faixa:{


color:COLORS.white,

fontSize:18,

fontWeight:"bold",


},



info:{


color:COLORS.textSecondary,

marginTop:5,


},



empty:{


color:COLORS.muted,


},


});