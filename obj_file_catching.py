from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import os

# 设置要输入的信息
message = 'a pair of basketball shoes'

# 设置下载目录
download_dir = 'C:\\Users\\26259\\Downloads'

# 设置目标网页的 URL
url = 'https://app.meshy.ai/workspace/text-to-3d/beta'

# 设置 ChromeDriver 的路径
chrome_driver_path = 'chromedriver-win64\\chromedriver-win64\\chromedriver.exe'

# 设置用户数据目录的路径
user_data_dir = 'C:\\Users\\26259\\AppData\\Local\\Google\\Chrome\\User Data' 


# 创建 Chrome 浏览器实例
service = Service(chrome_driver_path)
options = Options()
options.add_argument(f'user-data-dir={user_data_dir}') 
options.add_argument('profile-directory=Default')
options.add_argument('--no-sandbox')  
options.add_argument('--disable-dev-shm-usage') 
options.add_argument('--remote-debugging-port=9222')
options.add_experimental_option("prefs", {"download.default_directory": download_dir})
driver = webdriver.Chrome(service=service, options=options)

# 第零步：打开目标网页
driver.get(url)

# 第一步：在id=object-prompt的框里面输入message
# input_box = None
# while input_box == None:
#     try:
#         input_box = driver.find_element(By.ID, 'object-prompt')
#         time.sleep(1)
#     except:
#         pass
# input_box.send_keys(message)

# 第二步：点击指定的按钮
# generate_button = None
# while generate_button == None:
#     try:
#         generate_button = driver.find_element(By.CSS_SELECTOR, '.inline-flex.select-none.items-center.justify-center.whitespace-nowrap.font-medium.transition.duration-100.ease-out.focus\\:outline-none.focus-visible\\:ring-2.focus-visible\\:ring-offset-2.focus-visible\\:ring-offset-bg-base.pl-3.pr-4.h-10.rounded-xl.gap-2.w-full.text-base.active\\:opacity-70.border.border-transparent.text-accent-label.focus-visible\\:ring-accent-base.bg-accent-base.hover\\:bg-accent-base-hover.cursor-pointer')
#         time.sleep(1)
#     except:
#         pass
# generate_button.click()


# 第三步-第一部分：等待model div message
time.sleep(3)
model_div_message = 1
while model_div_message != None:
    try:
        model_div_message = driver.find_element(By.CSS_SELECTOR, '.group.relative.flex.items-center.justify-start.overflow-hidden.rounded-xl.bg-bg-base.px-4.py-5.text-label-muted')
        time.sleep(1)
    except:
        break

# 第三步-第二部分：点击指定的model_div
time.sleep(3)
model_div = None
while model_div == None:
    try:
        model_div = driver.find_element(By.CSS_SELECTOR, '.absolute.inset-0.flex.cursor-pointer.items-center.justify-center.bg-black\\/60.text-xs.text-label-base.opacity-0.group-hover\\:opacity-100')
        time.sleep(1)
    except:
        pass
model_div.click()


# 第四步：点击指定的按钮
download_icon_button = None
while download_icon_button == None:
    try:
        download_icon_button = driver.find_element(By.CSS_SELECTOR, "button[type='button'][data-type='icon-primary']")
        time.sleep(1)
    except:
        pass
download_icon_button.click()

# 第五步：点击glb按钮
glb_button = None
while glb_button == None:
    try:
        glb_button = driver.find_element(By.XPATH, "//button[@value='glb']")
        time.sleep(1)
    except:
        pass
glb_button.click()

# 第六步：点击下载按钮
download_button = None
while download_button == None:
    try:
        download_button = driver.find_element(By.XPATH, "(//button[@data-type='primary'])[2]")
        time.sleep(1)
    except:
        pass
download_button.click()

# 第七步：等待下载完成
download_wait_time = 60 
end_time = time.time() + download_wait_time
downloaded_files = set(os.listdir(download_dir))

while time.time() < end_time:
    current_files = set(os.listdir(download_dir))
    new_files = current_files - downloaded_files

    if new_files and not any(fname.endswith('.crdownload') for fname in new_files):
        break
    time.sleep(1) 

# 关闭浏览器
driver.quit()
