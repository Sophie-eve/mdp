PORT = 8000
SIMULATE = True          
UPDATE_SECONDS = 3      
MAX_HISTORY = 15
 
history = []            
lock = threading.Lock()
 
 
 
def check_tds(v):
    if v < 300:
        return "Excellent"
    if v < 600:
        return "Good"
    if v < 900:
        return "Fair"
    if v < 1200:
        return "Poor"
    return "UNSAFE"
 
 
def check_ph(v):
    if 6.5 <= v <= 8.5:
        return "Good"
    if 6.0 <= v < 6.5 or 8.5 < v <= 9.0:
        return "Warning"
    return "UNSAFE"
 
 
def check_temp(v):
    if 5 <= v <= 30:
        return "Good"
    if 30 < v <= 35:
        return "Warning"
    return "UNSAFE"
 
 
def check_turbidity(v):
    if v <= 1:
        return "Excellent"
    if v <= 5:
        return "Good"
    if v <= 10:
        return "Warning"
    return "UNSAFE"
 
 
def overall(r):
    states = [check_tds(r["tds"]), check_ph(r["ph"]),
              check_temp(r["temp"]), check_turbidity(r["turbidity"])]
    if "UNSAFE" in states:
        return "UNSAFE"
    if "Warning" in states or "Poor" in states or "Fair" in states:
        return "WARNING"
    return "SAFE"
 
 
def color_for(status):
    if status in ("Excellent", "Good", "SAFE"):
        return "green"
    if status in ("Fair", "Warning", "WARNING", "Poor"):
        return "orange"
    return "red"
