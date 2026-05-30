import {
View,
Text,
FlatList,
TouchableOpacity
}
from "react-native";

import {
Ionicons
}
from "@expo/vector-icons";

import { COLORS }
from "../../theme/colors";

export default function GalleryScreen(){

const memories = [

{ id:"1", type:"Photo" },

{ id:"2", type:"Video" },

{ id:"3", type:"Photo" },

{ id:"4", type:"Photo" }

];

return(

<View
style={{
flex:1,
backgroundColor:COLORS.background,
padding:20
}}
>

<Text
style={{
fontSize:32,
fontWeight:"bold",
color:"#fff",
marginBottom:20
}}
>
Gallery
</Text>

<FlatList
data={memories}
numColumns={2}
columnWrapperStyle={{
justifyContent:"space-between"
}}
keyExtractor={(item)=>item.id}
renderItem={({item})=>(

<View
style={{
backgroundColor:COLORS.card,
width:"48%",
height:180,
borderRadius:20,
marginBottom:18,
justifyContent:"center",
alignItems:"center"
}}
>

<Ionicons
name={
item.type === "Photo"
? "image"
: "videocam"
}
size={40}
color={COLORS.primary}
/>

<Text
style={{
color:"#fff",
marginTop:12
}}
>
{item.type}
</Text>

</View>

)}
/>

<TouchableOpacity
style={{
backgroundColor:COLORS.primary,
padding:18,
borderRadius:18,
alignItems:"center",
marginBottom:30
}}
>

<Text
style={{
color:"#fff",
fontWeight:"bold",
fontSize:16
}}
>
+ Upload
</Text>

</TouchableOpacity>

</View>

);

}
