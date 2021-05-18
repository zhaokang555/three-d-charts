out vec4 vertexColor; // 为片段着色器指定一个颜色输出
uniform vec4 color;

void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    vertexColor = color;
}