# 第6章 面向对象编程

> 来源：课程 PPT《第6章 面向对象编程》
> 复习目标：理解类、对象、属性、方法、封装、继承、多态，以及模块和包。

## 一、知识地图

类 Class
→ 对象 Object
→ 类属性 / 实例属性
→ 实例方法 / 静态方法 / 类方法
→ 私有化与封装
→ 继承
→ 多态
→ 模块与包

## 二、类与对象

类：对一类具有相同属性和方法的对象进行抽象。

定义：

    class Student:
        pass

对象是类的实例。

    stu1 = Student()

记忆：

    类 = 模板
    对象 = 根据模板创建出来的具体实例

## 三、__init__ 与实例属性

__init__ 是特殊方法，对象实例化时自动调用，用于初始化。

    class Student:
        def __init__(self, name):
            self.name = name

    tom = Student("Tom")

这里：

- name：传入的参数。
- self.name：当前对象自己的实例属性。

## 四、self

实例方法的第一个参数一般写 self。

    def study(self, time):
        ...

调用：

    tom.study(2)

调用时不需要手动把 tom 放进括号，Python 会自动把当前对象传给 self。

记忆：

    self = 当前正在调用该实例方法的对象

## 五、类属性与实例属性

类属性：

- 写在类中、各方法之外。
- 属于类层面。
- 可通过类名或对象名访问。

实例属性：

- 通常在 __init__ 中定义。
- 使用 self.xxx。
- 每个对象可以有自己的值。

## 六、三种方法

### 实例方法

    def method(self, ...):

与具体对象有关。

### 静态方法

    @staticmethod
    def method(...):

不需要 self，与某个具体实例无关。

### 类方法

    @classmethod
    def method(cls, ...):

第一个参数一般写 cls，代表当前类对象。

## 七、封装与私有化

PPT 指出：Python 没有严格意义上的封装性。

私有化的目的：

- 限制直接访问。
- 保护数据。
- 让外部代码通过允许的方法操作数据。

本章重点是理解“封装”的思想。

## 八、继承

子类可以继承父类的方法。

    class Animal:
        def eat(self):
            ...

    class Dog(Animal):
        pass

Dog 是 Animal 的子类，Dog 对象可以使用从父类继承的方法。

## 九、多态与方法重写

PPT 的定义：

不同功能的方法可以使用相同的方法名，根据对象不同调用不同实现。

例如子类重新定义父类同名方法：

    class Bird:
        def behavior(self, action):
            ...

    class Swallow(Bird):
        def behavior(self, action):
            ...

子类对象调用时会使用子类自己的重写版本。

## 十、模块与包

PPT 中：

- 一个 .py 文件可看作一个模块。
- 模块中可以包含函数、变量、类以及导入的其他模块。
- 多个模块可以组成一个包。
- PPT 将包描述为包含 __init__.py 和一个或多个模块的目录。

## 十一、本章最该记住

    类 → 模板
    对象 → 类的实例
    self → 当前对象
    __init__ → 实例化时自动初始化
    继承 → 子类获得父类能力
    重写/多态 → 同名方法在不同类中可有不同实现
