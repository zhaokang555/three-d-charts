in vec4 vertexColor; // 从顶点着色器传来的输入变量（名称相同、类型相同）

void main(){
    gl_FragColor = vertexColor;
}