---
layout: post
title: "Configuração do Wayland no Gnome 48 com NVIDIA no Debian 12/13"
date: 2025-09-21 19:25:00 -0300
categories: debian
---
# Sobre o conteúdo

Nesse post, vou mostrar como é fácil instalar e configurar o wayland no Gnome 48 com placa de vídeo NVIDIA no Debian 12/13.

## Instalação do driver NVIDIA

No momento que escrevo esse post, estou usando Debian 13 (trixie) com o kernel 6.16.7 e Gnome 48.5.
O Driver NVIDIA utilizado é o 580.82.09 e a placa de vídeo é uma RTX 3070.

O download do driver você pode fazer diretamente no site da NVIDIA [aqui](https://www.nvidia.com/Download/index.aspx).
E para instalar o driver, após o download, primeiramente torne o arquivo executável com permissão de execução:
~~~shell
chmod +x NVIDIA-Linux-x86_64-580.82.09.run
~~~
após isso, execute o arquivo como superusuário:
~~~shell
sudo ./NVIDIA-Linux-x86_64-580.82.09.run
~~~
E siga o passo a passo da instalação.

A primeira etapa ele irá questionar sobre qual módulo vocẽ deseja utilizar, pois nesse sistema há duas opções: NVidia Proprietário e MIT/GPL.
Eu geralmente utiliza o módulo de kernel open source (MIT/GPL), mas você pode escolher o que melhor se adequa a sua necessidade.
![Módulo de kernel NVIDIA](/assets/nvidia_driver/nvidia_kernel_module.png)

A próxima etapa ele avisa que estou executando o instalador em um ambiente gráfico e que é recomendado sair do ambiente gráfico para evitar possíveis problemas. Porém eu costumo instalar direto no ambiente gráfico e nunca tive problemas.
![Aviso de ambiente gráfico](/assets/nvidia_driver/nvidia_graphic_env.png)

Logo após vem outro aviso sobre o módulo de kernel 'nvidia-uvm' que está carregado e que é necessário descarregá-lo para continuar a instalação. Novamente, eu costumo prosseguir com a instalação mesmo com o módulo carregado e nunca tive problemas.
![Aviso de módulo carregado](/assets/nvidia_driver/nvidia_uvm_loaded.png)

Mais um aviso, que é sobre continuar a instalação mesmo sem a possibilidade de rodar as sanity checks, novamente eu costumo prosseguir e nunca tive problemas.
![Aviso de sanity checks](/assets/nvidia_driver/nvidia_sanity_checks.png)

E o último aviso apenas reforçando que algumas sanitiy checks não poderão ser executadas e que é recomendado reiniciar o sistema após a instalação.
![Aviso final](/assets/nvidia_driver/nvidia_final_warning.png)

Se você tem algum receio, pode seguir as recomendações e sair do ambiente gráfico, descarregar o módulo e então rodar o instalador, mas como eu disse, nunca tive problemas em prosseguir com a instalação mesmo com esses avisos.

O modo mais fácil é iniciar o sistema em modo de recuperação (recovery mode) e então prosseguir com a instalação.

Após todos os avisos iniciais, vem mais um aviso kkkkkk
Agora sobre o sistema já possuir um driver instalado e que ele será removido durante a instalação.
![Aviso de driver existente](/assets/nvidia_driver/nvidia_existing_driver.png)

Então ele começa a construir o módulo de kernel.
![Construção do módulo de kernel](/assets/nvidia_driver/nvidia_building_kernel_module.png)

E ao concluir ele solicita se você deseja assinar o módulo de kernel.
Aqui é importante assinar o módulo, pois caso contrário, se você estiver com o SecureBoot habilitado na BIOS, o módulo não será carregado.
![Assinatura do módulo de kernel](/assets/nvidia_driver/nvidia_sign_kernel_module.png)

Ao assinar o módulo, ele irá solicitar se você já possui uma chave criada ou se deseja criar uma nova.
Se você já usa DKMS e já possui outros módulos assinados, pode usar a mesma chave.

Veja meu artigo sobre como [assinar módulos de kernel com DKMS]({% post_url 2023-09-16-assinando-modulos-dkms %}).
![Chave para assinatura do módulo](/assets/nvidia_driver/nvidia_signing_key.png)

Ao selecionar a opção de usar um par de chaves existentes, ele irá solicitar primeiro o arquivo da chave privada e depois o arquivo da chave pública.
![Seleção da chave privada](/assets/nvidia_driver/nvidia_select_private_key.png)
![Seleção da chave pública](/assets/nvidia_driver/nvidia_select_public_key.png)

Ao finalizar ele assina o módulo e solicita se você deseja instalar as bibliotecas de 32 bits.
Eu geralmente instalo, mas se você não for usar algum software que precise dessas bibliotecas, pode optar por não instalar.
![Instalação das bibliotecas de 32 bits](/assets/nvidia_driver/nvidia_install_32bits_libraries.png)

Então ele irá desinstalar o driver antigo.
![Desinstalação do driver antigo](/assets/nvidia_driver/nvidia_uninstalling_old_driver.png)

E ao terminar a desinstalação, ele pergunta se você deseja registrar os módulos do kernel no DKMS.
Aqui é importante selecionar "Yes", assim o módulo será registrado no DKMS e sempre que houver uma atualização do kernel, o módulo será reconstruído automaticamente.
![Registro no DKMS](/assets/nvidia_driver/nvidia_register_dkms.png)

Ao aceitar o registro então ele prossegue com a instalação.
![Registro no DKMS](/assets/nvidia_driver/nvidia_dkms_registering.png)
![Instalação do driver](/assets/nvidia_driver/nvidia_installing_driver.png)

Ao finalizar a instalação, ele pergunta se você deseja executar o utilitário de configuração nvidia-xconfig para atualizar o arquivo xorg.conf.
Aqui é importante selecionar "No", pois se você selecionar "Yes", ele irá criar um arquivo xorg.conf que é de uso do Xorg (X11), e como queremos usar o Wayland, não precisamos desse arquivo.

Ademais, já temos esse arquivo criado pois por padrão o gnome usa o Xorg como servidor gráfico quando utilizado um driver proprietário da NVIDIA.
![nvidia-xconfig](/assets/nvidia_driver/nvidia_xconfig.png)

E no final apenas temos a confirmação de que a instalação foi concluída com sucesso e novamente um lembrete para reiniciar o sistema.
![Instalação concluída](/assets/nvidia_driver/nvidia_installation_complete.png)
![Reiniciar o sistema](/assets/nvidia_driver/nvidia_reboot_system.png)

## Habilitando o módulo kernel nvidia-drm

No debian 12/13, o módulo `nvidia-drm` não é carregado por padrão, e ele é essencial para que o Wayland funcione corretamente com o driver proprietário da NVIDIA.

Para incializar o módulo `nvidia-drm` durante a inicialização do sistema, podemos editar o editar o arquivo do gerenciador de inicialização.

No meu caso eu utilizo o GRUB, então edito o arquivo `/etc/default/grub` e adiciono a seguinte linha:
~~~shell
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash ... nvidia-drm.modeset=1"
~~~

Veja um exemplo do meu arquivo `/etc/default/grub`: 
![Exemplo do arquivo grub](/assets/nvidia_driver/grub_example.png)

Após ediytar o arquivo, salve e então atualize o GRUB com o comando:
~~~shell
sudo update-grub
~~~

## Verificando os serviços adicionais da NVIDIA
Também é importante verificar se os serviços adicionais da NVIDIA estão habilitados e rodando corretamente.
Esses serviços são: `nvidia-hibernate.service`, `nvidia-resume.service` e `nvidia-suspend.service`.

Para verificar o status desses serviços, rode o comando:
~~~shell
systemctl status nvidia-hibernate.service nvidia-resume.service nvidia-suspend.service
~~~
Se eles não estiverem habilitados, você pode habilitá-los com o comando:
~~~shell
sudo systemctl enable nvidia-hibernate.service nvidia-resume.service nvidia-suspend.service
~~~

Além disso, você precisará verificar se o parâmetro do módulo NVIDIA PreserveVideoMemoryAllocations está ativado.
Para isso, rode o seguinte comando:
~~~shell
echo 'options nvidia NVreg_PreserveVideoMemoryAllocations=1' > /etc/modprobe.d/nvidia-power-management.conf
~~~

Esses serviços são importantes para o gerenciamento de energia e para evitar problemas de tela preta ao suspender ou hibernar o sistema. E caso não estejam habilitados, o GDM não irá habilitar a opção de usar o Wayland no Gnome.

As regras podem ser vistas no arquivo `/usr/lib/udev/rules.d/61-gdm.rules`.

## Finalizando

Após todas essas configurações, reinicie o sistema e na tela de login do GDM, clique no ícone de engrenagem e selecione a opção "GNOME".
Você verá que além dessa opção, também estará disponível a opção "GNOME sobre Xorg", que é o backend X11.

Só selecionar a opção "GNOME" e fazer login normalmente.
Ao visualizar as informações do sistema, você verá que o Wayland está ativo.
![Wayland ativo](/assets/nvidia_driver/gnome_wayland_active.png)

E é isso galera, espero que esse post tenha ajudado vocês a configurar o Wayland no Gnome com placa de vídeo NVIDIA no Debian 12/13.
Abraços! ❤️