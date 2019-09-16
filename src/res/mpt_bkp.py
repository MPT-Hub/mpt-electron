import sys
import pandas as pd
import numpy as np

# dataFile = sys.argv[1]


# Definição de funções --------------------------------------------------------
def import_file(filename):
    """
    Importa dados do ficheiro original gerado pelo ImageJ/Particle Tracker
    """
    data = pd.read_csv(
        filename,
        skiprows=76670,
        delim_whitespace=True,
        usecols=[1, 2],
        names=["x", "y"],
        decimal=",",
    )
    return data


def clean_data(data):
    data.loc[:, "x"].replace(
        to_replace="Trajectory", value="0", regex=True, inplace=True
    )

    return data


def correct_separator(data):
    data.loc[:, "x"].replace(to_replace=",", value=".",
                             regex=True, inplace=True)
    return data


def remove_index(data):
    data.reset_index(drop=True, inplace=True)
    return data


def add_label(data):
    data["x"] = pd.to_numeric(data["x"])
    data["y"] = pd.to_numeric(data["y"])
    return data


def prepare_data(data):
    """
    Prepara os dados para uso.
    - Calcula o número de frames de cada trajetoria;
    - Seleciona as trajetótias adequadas;
    - Remove do 'DataFrame' as trajetórias inadequadas;
    - Retorna uma lista de trajetórias.
    """
    result = []
    last_index = 0
    last_row = data.shape[0]
    count = 0
    is_valid = False
    for ind, row in data.iterrows():
        if data.loc[ind, "x"] == 0:
            index = ind
            count = ind - last_index
            is_valid = True if count >= 560 else False

            if is_valid:
                result.append(data.iloc[last_index:index])

            last_index = ind + 1

    count = last_row - last_index
    is_valid = True if count >= 560 else False

    if is_valid:
        result.append(data.iloc[last_index:index])

    return result


def get_data_info(data_list):
    """
    Retorna texto com dados da lista da amostragem em análise.
    """
    result = f"\nThe imported data file has {len(data_list)} good trajectories:\n\n"
    i = 1
    for data in data_list:
        result += f"Trajectory {i} contains {len(data)} frames.\n"
        i += 1
    return result


def calc_msd(trajectory, t_step, coords=["x", "y"]):
    """
    Calcula os seguites dados:
    - MSD em pixel² (msdp)
    - MSD em um² (msdm)
    - Deff em pixel² (deffp)
    - Deff em um² (deffm)
    """
    tau = trajectory["t"].copy()
    shifts = np.floor(tau / t_step).astype(np.int)
    msdp = np.zeros(shifts.size)
    # msdp_std = np.zeros(shifts.size)

    for i, shift in enumerate(shifts):
        diffs = trajectory[coords] - trajectory[coords].shift(-shift)
        sqdist = np.square(diffs).sum(axis=1)
        msdp[i] = sqdist.mean()
        # msds_std[i] = sqdist.std() # std = tandard deviation (desvio padrão)

    # deffp = msdp / (4 * dt)
    # msdm = msdp * (1 / 1.54 ** 2)
    # deffm = deffp * (1 / 1.54 ** 2)

    # msds = pd.DataFrame(
    #     {"tau": tau, "msdp": msdp, "msdm": msdm, "deffp": deffp, "deffm": deffm}
    # )
    # return msds
    return msdp


def export_data(data):
    """
    Exporta arquivo ".csv" com os dados
    """
    # data = data[data["x"] != "Trajectory"]
    data.to_csv("./data/data.txt", sep=";", decimal=",", index=False)
    # data.to_csv("data_2.txt", sep=";", header=False)


# class Trajectory:
#     def __init__(self, frames):
#         self.frames = []

#     def getFrames(self):
#         return self.frames


# Início do programa ----------------------------------------------------------

dataFile = "../data/Movie78.txt"
data = import_file(dataFile)
data = clean_data(data)
data = correct_separator(data)
data = remove_index(data)
data = add_label(data)

data_list = prepare_data(data)

# MSD - Parameters
video_len = 20  # Get data from user
max_time = video_len

# -------------------------------------------------------------------- Dev
# TODO: For each data_lis[i], call code below
N = len(data_list[0])  # Get data from each item on data_list
dt = max_time / N

# MSD - Generate 2D brownian motion
t = np.linspace(0, max_time, N)
xy = data_list[0].values
trajectory = pd.DataFrame({"t": t, "x": xy[:, 0], "y": xy[:, 1]})
tau = trajectory["t"].copy()

# Compute MSD
msdp = calc_msd(trajectory, t_step=dt, coords=["x", "y"])
msdm = msdp * (1 / 1.54 ** 2)

# Compute Deff
deffp = msdp / (4 * dt)
deffm = deffp * (1 / 1.54 ** 2)

# Final data
msd = pd.DataFrame(
    {"tau": tau, "msdp": msdp, "msdm": msdm, "deffp": deffp, "deffm": deffm}
)
# ------------------------------------------------------------------------

# ? Gerar gráficos?

# export_data(data_list[0])

print(get_data_info(data_list))

# time = datetime.datetime.now() - time
# print(f"\nTotal time spent: {time}")

msd.drop(msd.index[[0, -1]], inplace=True)
msd = msd[msd["tau"] < 10]

# print(msd.to_json(orient="records"))
# sys.stdout.flush()
